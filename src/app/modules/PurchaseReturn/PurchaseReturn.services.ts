import {
  purchaseReturnQueryValidationConfig,
  purchaseReturnSearchableFields,
} from "./PurchaseReturn.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreatePurchaseReturnPayload,
  UpdatePurchaseReturnPayload,
} from "./PurchaseReturn.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { Prisma } from "../../../../prisma/generated";

// Helper function to generate unique return number
const generateReturnNumber = async (): Promise<string> => {
  const prefix = "PRET";
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  
  // Get count of returns today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const count = await prisma.purchaseReturn.count({
    where: {
      created_at: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });
  
  const sequence = String(count + 1).padStart(4, "0");
  return `${prefix}-${year}${month}-${sequence}`;
};

// -------------------------------------- CREATE PURCHASE RETURN -----------------------------------
const createPurchaseReturn = async (data: CreatePurchaseReturnPayload, user: TAuthUser) => {
  if (!user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }

  // Validate purchase belongs to company
  const purchase = await prisma.purchase.findFirst({
    where: {
      id: data.purchase_id,
      vendor: {
        company_id: user.company_id,
      },
    },
    include: {
      items: true,
    },
  });

  if (!purchase) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Purchase not found");
  }

  // Validate store belongs to company
  const store = await prisma.store.findFirst({
    where: {
      id: data.store_id,
      company_id: user.company_id,
    },
  });

  if (!store) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Store not found");
  }

  // Validate all products exist and were part of the original purchase
  for (const item of data.items) {
    const product = await prisma.product.findFirst({
      where: {
        id: item.product_id,
      },
    });

    if (!product) {
      throw new CustomizedError(
        httpStatus.NOT_FOUND,
        `Product with ID ${item.product_id} not found`
      );
    }

    // Check if product was part of the original purchase
    const purchaseItem = purchase.items.find(pi => pi.product_id === item.product_id);
    if (!purchaseItem) {
      throw new CustomizedError(
        httpStatus.BAD_REQUEST,
        `Product ${product.name} was not part of the original purchase`
      );
    }

    // Check if return quantity doesn't exceed purchase quantity
    if (item.quantity > Number(purchaseItem.quantity)) {
      throw new CustomizedError(
        httpStatus.BAD_REQUEST,
        `Return quantity for ${product.name} (${item.quantity}) exceeds purchase quantity (${purchaseItem.quantity})`
      );
    }

    // Check inventory availability (we need to have the items to return them)
    const inventory = await prisma.inventory.findUnique({
      where: {
        product_id_store_id: {
          product_id: item.product_id,
          store_id: data.store_id,
        },
      },
    });

    if (!inventory || inventory.quantity < item.quantity) {
      throw new CustomizedError(
        httpStatus.BAD_REQUEST,
        `Insufficient inventory for product ${product.name} to return. Available: ${inventory?.quantity || 0}, Required: ${item.quantity}`
      );
    }
  }

  // Generate return number
  const return_number = await generateReturnNumber();

  // Calculate total_price for each item and refund_amount
  const itemsWithTotal = data.items.map((item) => ({
    ...item,
    total_price: item.quantity * item.unit_price,
  }));

  const refund_amount = itemsWithTotal.reduce((sum, item) => sum + Number(item.total_price), 0);

  // Create purchase return with items in a transaction
  const purchaseReturn = await prisma.$transaction(async (tx) => {
    // Create purchase return
    const newPurchaseReturn = await tx.purchaseReturn.create({
      data: {
        return_number,
        purchase_id: data.purchase_id,
        store_id: data.store_id,
        return_date: data.return_date ? new Date(data.return_date) : new Date(),
        reason: data.reason,
        refund_amount,
        status: data.status,
        notes: data.notes,
        creator_id: user.id,
      },
      include: {
        purchase: true,
        store: true,
        created_by: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create purchase return items
    await tx.purchaseReturnItem.createMany({
      data: itemsWithTotal.map((item) => ({
        purchase_return_id: newPurchaseReturn.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    });

    // Deduct inventory for each returned product (opposite of purchase)
    for (const item of itemsWithTotal) {
      await tx.inventory.update({
        where: {
          product_id_store_id: {
            product_id: item.product_id,
            store_id: data.store_id,
          },
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    return newPurchaseReturn;
  });

  // Fetch purchase return with items
  const result = await prisma.purchaseReturn.findUnique({
    where: { id: purchaseReturn.id },
    include: {
      purchase: true,
      store: true,
      created_by: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return result;
};

// -------------------------------------- GET PURCHASE RETURNS -------------------------------------
const getPurchaseReturns = async (user: TAuthUser, query: Record<string, any>) => {
  if (!user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }
  
  const {
    search_term,
    page,
    limit,
    sort_by,
    sort_order,
    from_date,
    to_date,
    ...remainingQuery
  } = query;

  if (sort_by) queryValidator(purchaseReturnQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(purchaseReturnQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  // Build where conditions for company's purchase returns
  const andConditions: Prisma.PurchaseReturnWhereInput[] = [
    {
      store: {
        company_id: user.company_id,
      },
    },
  ];

  if (search_term) {
    andConditions.push({
      OR: purchaseReturnSearchableFields.map((field) => {
        return {
          [field]: {
            contains: search_term.trim(),
            mode: "insensitive",
          },
        };
      }),
    });
  }

  if (from_date) {
    const date = validDateChecker(from_date, "fromDate");
    andConditions.push({
      return_date: {
        gte: date,
      },
    });
  }

  if (to_date) {
    const date = validDateChecker(to_date, "toDate");
    andConditions.push({
      return_date: {
        lte: date,
      },
    });
  }

  if (Object.keys(remainingQuery).length) {
    for (const [key, value] of Object.entries(remainingQuery)) {
      queryValidator(purchaseReturnQueryValidationConfig, key, value);
      andConditions.push({
        [key]: value.includes(",") ? { in: value.split(",") } : value,
      });
    }
  }

  const whereConditions = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.purchaseReturn.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      include: {
        purchase: true,
        store: true,
        created_by: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.purchaseReturn.count({
      where: whereConditions,
    }),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
    data: result,
  };
};

// -------------------------------------- GET PURCHASE RETURN (SINGLE) -----------------------------
const getPurchaseReturn = async (id: string, company_id: string) => {
  const result = await prisma.purchaseReturn.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
    include: {
      purchase: true,
      store: true,
      created_by: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!result) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Purchase return not found");
  }

  return result;
};

// -------------------------------------- UPDATE PURCHASE RETURN -----------------------------------
const updatePurchaseReturn = async (
  id: string,
  company_id: string,
  payload: UpdatePurchaseReturnPayload
) => {
  // Check if purchase return exists and belongs to company
  const existingPurchaseReturn = await prisma.purchaseReturn.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
  });

  if (!existingPurchaseReturn) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Purchase return not found");
  }

  // Validate purchase if provided
  if (payload.purchase_id) {
    const purchase = await prisma.purchase.findFirst({
      where: {
        id: payload.purchase_id,
        vendor: {
          company_id,
        },
      },
    });

    if (!purchase) {
      throw new CustomizedError(httpStatus.NOT_FOUND, "Purchase not found");
    }
  }

  // Validate store if provided
  if (payload.store_id) {
    const store = await prisma.store.findFirst({
      where: {
        id: payload.store_id,
        company_id,
      },
    });

    if (!store) {
      throw new CustomizedError(httpStatus.NOT_FOUND, "Store not found");
    }
  }

  // Update purchase return with items in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update purchase return
    const updatedPurchaseReturn = await tx.purchaseReturn.update({
      where: { id },
      data: {
        purchase_id: payload.purchase_id,
        store_id: payload.store_id,
        return_date: payload.return_date ? new Date(payload.return_date) : undefined,
        reason: payload.reason,
        refund_amount: payload.refund_amount,
        status: payload.status,
        notes: payload.notes,
      },
    });

    // Update items if provided
    if (payload.items) {
      // Delete existing items
      await tx.purchaseReturnItem.deleteMany({
        where: { purchase_return_id: id },
      });

      // Create new items
      const itemsWithTotal = payload.items.map((item) => ({
        ...item,
        total_price: item.quantity * item.unit_price,
      }));

      await tx.purchaseReturnItem.createMany({
        data: itemsWithTotal.map((item) => ({
          purchase_return_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      });
    }

    return updatedPurchaseReturn;
  });

  // Fetch updated purchase return with relations
  const updatedResult = await prisma.purchaseReturn.findUnique({
    where: { id },
    include: {
      purchase: true,
      store: true,
      created_by: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return updatedResult;
};

// -------------------------------------- DELETE PURCHASE RETURN -----------------------------------
const deletePurchaseReturn = async (id: string, company_id: string) => {
  // Check if purchase return exists and belongs to company
  const existingPurchaseReturn = await prisma.purchaseReturn.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
  });

  if (!existingPurchaseReturn) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Purchase return not found");
  }

  // Delete purchase return (items will be deleted automatically due to cascade)
  await prisma.purchaseReturn.delete({
    where: { id },
  });

  return { message: "Purchase return deleted successfully" };
};

export const PurchaseReturnServices = {
  createPurchaseReturn,
  getPurchaseReturns,
  getPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
};
