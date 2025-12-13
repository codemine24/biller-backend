import {
  purchaseQueryValidationConfig,
  purchaseSearchableFields,
} from "./Purchase.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreatePurchasePayload,
  UpdatePurchasePayload,
} from "./Purchase.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { Prisma, Store } from "../../../../prisma/generated";

// Helper function to generate unique invoice number
const generateInvoiceNumber = async (store: Store): Promise<string> => {
  const storePrefix =  store.name.slice(0, 3).toUpperCase()
  const prefix = "PUR";
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  
  // Get count of purchases today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const count = await prisma.purchase.count({
    where: {
      created_at: {
        gte: startOfDay,
        lte: endOfDay,
      },
      store_id: store.id 
    },
  });
  
  const sequence = String(count + 1).padStart(4, "0");
  return `${prefix}-${storePrefix}-${year}${month}-${sequence}`;
};

// -------------------------------------- CREATE PURCHASE -----------------------------------
const createPurchase = async (data: CreatePurchasePayload, user: TAuthUser) => {
  if (!user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }

  // Validate vendor belongs to company
  const vendor = await prisma.vendor.findFirst({
    where: {
      id: data.vendor_id,
      company_id: user.company_id,
    },
  });

  if (!vendor) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Vendor not found");
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

  // Validate all products
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
  }

  // Generate invoice number
  const invoice_number = await generateInvoiceNumber(store);

  console.log(invoice_number)

  // Calculate total_price for each item and total_amount
  const itemsWithTotal = data.items.map((item) => ({
    ...item,
    total_price: item.quantity * item.unit_price,
  }));

  const total_amount = itemsWithTotal.reduce((sum, item) => sum + Number(item.total_price), 0);

  // Calculate paid_amount and due_amount
  const paid_amount = data.paid_amount || 0;
  const due_amount = total_amount - paid_amount;

  // Create purchase with items in a transaction
  const purchase = await prisma.$transaction(async (tx) => {
    // Create purchase
    const newPurchase = await tx.purchase.create({
      data: {
        invoice_number,
        vendor_id: data.vendor_id,
        store_id: data.store_id,
        purchase_date: data.purchase_date ? new Date(data.purchase_date) : new Date(),
        total_amount,
        paid_amount,
        due_amount,
        status: data.status,
        notes: data.notes,
        creator_id: user.id,
      },
      include: {
        vendor: true,
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

    // Create purchase items with calculated total_price
    await tx.purchaseItem.createMany({
      data: itemsWithTotal.map((item) => ({
        purchase_id: newPurchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    });

    // Update inventory for each purchased product
    for (const item of itemsWithTotal) {
      await tx.inventory.upsert({
        where: {
          product_id_store_id: {
            product_id: item.product_id,
            store_id: data.store_id,
          },
        },
        update: {
          quantity: {
            increment: item.quantity,
          },
        },
        create: {
          product_id: item.product_id,
          store_id: data.store_id,
          quantity: item.quantity,
        },
      });
    }

    return newPurchase;
  });

  // Fetch purchase with items
  const result = await prisma.purchase.findUnique({
    where: { id: purchase.id },
    include: {
      vendor: true,
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

// -------------------------------------- GET PURCHASES -------------------------------------
const getPurchases = async (user: TAuthUser, query: Record<string, any>) => {
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

  if (sort_by) queryValidator(purchaseQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(purchaseQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  // Build where conditions for company's purchases
  const andConditions: Prisma.PurchaseWhereInput[] = [
    {
      vendor: {
        company_id: user.company_id,
      },
    },
  ];

  if (search_term) {
    andConditions.push({
      OR: purchaseSearchableFields.map((field) => {
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
      purchase_date: {
        gte: date,
      },
    });
  }

  if (to_date) {
    const date = validDateChecker(to_date, "toDate");
    andConditions.push({
      purchase_date: {
        lte: date,
      },
    });
  }

  if (Object.keys(remainingQuery).length) {
    for (const [key, value] of Object.entries(remainingQuery)) {
      queryValidator(purchaseQueryValidationConfig, key, value);
      andConditions.push({
        [key]: value.includes(",") ? { in: value.split(",") } : value,
      });
    }
  }

  const whereConditions = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.purchase.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      include: {
        vendor: true,
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
    prisma.purchase.count({
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

// -------------------------------------- GET PURCHASE (SINGLE) -----------------------------
const getPurchase = async (id: string, company_id: string) => {
  const result = await prisma.purchase.findFirst({
    where: {
      id,
      vendor: {
        company_id,
      },
    },
    include: {
      vendor: true,
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
    throw new CustomizedError(httpStatus.NOT_FOUND, "Purchase not found");
  }

  return result;
};

// -------------------------------------- UPDATE PURCHASE -----------------------------------
const updatePurchase = async (
  id: string,
  company_id: string,
  payload: UpdatePurchasePayload
) => {
  // Check if purchase exists and belongs to company
  const existingPurchase = await prisma.purchase.findFirst({
    where: {
      id,
      vendor: {
        company_id,
      },
    },
  });

  if (!existingPurchase) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Purchase not found");
  }

  // Validate vendor if provided
  if (payload.vendor_id) {
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: payload.vendor_id,
        company_id,
      },
    });

    if (!vendor) {
      throw new CustomizedError(httpStatus.NOT_FOUND, "Vendor not found");
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

  // Update purchase with items in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update purchase
    const updatedPurchase = await tx.purchase.update({
      where: { id },
      data: {
        vendor_id: payload.vendor_id,
        store_id: payload.store_id,
        purchase_date: payload.purchase_date ? new Date(payload.purchase_date) : undefined,
        total_amount: payload.total_amount,
        paid_amount: payload.paid_amount,
        due_amount: payload.due_amount,
        status: payload.status,
        notes: payload.notes,
      },
    });

    // Update items if provided
    if (payload.items) {
      // Delete existing items
      await tx.purchaseItem.deleteMany({
        where: { purchase_id: id },
      });

      // Create new items
      await tx.purchaseItem.createMany({
        data: payload.items.map((item) => ({
          purchase_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      });
    }

    return updatedPurchase;
  });

  // Fetch updated purchase with relations
  const updatedResult = await prisma.purchase.findUnique({
    where: { id },
    include: {
      vendor: true,
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

// -------------------------------------- DELETE PURCHASE -----------------------------------
const deletePurchase = async (id: string, company_id: string) => {
  // Check if purchase exists and belongs to company
  const existingPurchase = await prisma.purchase.findFirst({
    where: {
      id,
      vendor: {
        company_id,
      },
    },
    include: {
      purchase_returns: true,
    },
  });

  if (!existingPurchase) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Purchase not found");
  }

  // Check if purchase has returns
  if (existingPurchase.purchase_returns.length > 0) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "Cannot delete purchase with existing returns"
    );
  }

  // Delete purchase (items will be deleted automatically due to cascade)
  await prisma.purchase.delete({
    where: { id },
  });

  return { message: "Purchase deleted successfully" };
};

export const PurchaseServices = {
  createPurchase,
  getPurchases,
  getPurchase,
  updatePurchase,
  deletePurchase,
};
