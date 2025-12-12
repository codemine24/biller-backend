import {
  saleReturnQueryValidationConfig,
  saleReturnSearchableFields,
} from "./SaleReturn.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreateSaleReturnPayload,
  UpdateSaleReturnPayload,
} from "./SaleReturn.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { Prisma } from "../../../../prisma/generated";

// Helper function to generate unique return number
const generateReturnNumber = async (): Promise<string> => {
  const prefix = "RET";
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  
  // Get count of returns today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const count = await prisma.saleReturn.count({
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

// -------------------------------------- CREATE SALE RETURN -----------------------------------
const createSaleReturn = async (data: CreateSaleReturnPayload, user: TAuthUser) => {
  if (!user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }

  // Validate sale belongs to company
  const sale = await prisma.sale.findFirst({
    where: {
      id: data.sale_id,
      store: {
        company_id: user.company_id,
      },
    },
    include: {
      items: true,
    },
  });

  if (!sale) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Sale not found");
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

  // Validate all products exist and were part of the original sale
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

    // Check if product was part of the original sale
    const saleItem = sale.items.find(si => si.product_id === item.product_id);
    if (!saleItem) {
      throw new CustomizedError(
        httpStatus.BAD_REQUEST,
        `Product ${product.name} was not part of the original sale`
      );
    }

    // Check if return quantity doesn't exceed sale quantity
    if (item.quantity > Number(saleItem.quantity)) {
      throw new CustomizedError(
        httpStatus.BAD_REQUEST,
        `Return quantity for ${product.name} (${item.quantity}) exceeds sale quantity (${saleItem.quantity})`
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

  // Create sale return with items in a transaction
  const saleReturn = await prisma.$transaction(async (tx) => {
    // Create sale return
    const newSaleReturn = await tx.saleReturn.create({
      data: {
        return_number,
        sale_id: data.sale_id,
        store_id: data.store_id,
        return_date: data.return_date ? new Date(data.return_date) : new Date(),
        reason: data.reason,
        refund_amount,
        status: data.status,
        notes: data.notes,
        creator_id: user.id,
      },
      include: {
        sale: true,
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

    // Create sale return items
    await tx.saleReturnItem.createMany({
      data: itemsWithTotal.map((item) => ({
        sale_return_id: newSaleReturn.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    });

    // Restore inventory for each returned product
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

    return newSaleReturn;
  });

  // Fetch sale return with items
  const result = await prisma.saleReturn.findUnique({
    where: { id: saleReturn.id },
    include: {
      sale: true,
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

// -------------------------------------- GET SALE RETURNS -------------------------------------
const getSaleReturns = async (user: TAuthUser, query: Record<string, any>) => {
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

  if (sort_by) queryValidator(saleReturnQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(saleReturnQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  // Build where conditions for company's sale returns
  const andConditions: Prisma.SaleReturnWhereInput[] = [
    {
      store: {
        company_id: user.company_id,
      },
    },
  ];

  if (search_term) {
    andConditions.push({
      OR: saleReturnSearchableFields.map((field) => {
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
      queryValidator(saleReturnQueryValidationConfig, key, value);
      andConditions.push({
        [key]: value.includes(",") ? { in: value.split(",") } : value,
      });
    }
  }

  const whereConditions = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.saleReturn.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      include: {
        sale: true,
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
    prisma.saleReturn.count({
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

// -------------------------------------- GET SALE RETURN (SINGLE) -----------------------------
const getSaleReturn = async (id: string, company_id: string) => {
  const result = await prisma.saleReturn.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
    include: {
      sale: true,
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
    throw new CustomizedError(httpStatus.NOT_FOUND, "Sale return not found");
  }

  return result;
};

// -------------------------------------- UPDATE SALE RETURN -----------------------------------
const updateSaleReturn = async (
  id: string,
  company_id: string,
  payload: UpdateSaleReturnPayload
) => {
  // Check if sale return exists and belongs to company
  const existingSaleReturn = await prisma.saleReturn.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
  });

  if (!existingSaleReturn) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Sale return not found");
  }

  // Validate sale if provided
  if (payload.sale_id) {
    const sale = await prisma.sale.findFirst({
      where: {
        id: payload.sale_id,
        store: {
          company_id,
        },
      },
    });

    if (!sale) {
      throw new CustomizedError(httpStatus.NOT_FOUND, "Sale not found");
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

  // Update sale return with items in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update sale return
    const updatedSaleReturn = await tx.saleReturn.update({
      where: { id },
      data: {
        sale_id: payload.sale_id,
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
      await tx.saleReturnItem.deleteMany({
        where: { sale_return_id: id },
      });

      // Create new items
      const itemsWithTotal = payload.items.map((item) => ({
        ...item,
        total_price: item.quantity * item.unit_price,
      }));

      await tx.saleReturnItem.createMany({
        data: itemsWithTotal.map((item) => ({
          sale_return_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      });
    }

    return updatedSaleReturn;
  });

  // Fetch updated sale return with relations
  const updatedResult = await prisma.saleReturn.findUnique({
    where: { id },
    include: {
      sale: true,
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

// -------------------------------------- DELETE SALE RETURN -----------------------------------
const deleteSaleReturn = async (id: string, company_id: string) => {
  // Check if sale return exists and belongs to company
  const existingSaleReturn = await prisma.saleReturn.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
  });

  if (!existingSaleReturn) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Sale return not found");
  }

  // Delete sale return (items will be deleted automatically due to cascade)
  await prisma.saleReturn.delete({
    where: { id },
  });

  return { message: "Sale return deleted successfully" };
};

export const SaleReturnServices = {
  createSaleReturn,
  getSaleReturns,
  getSaleReturn,
  updateSaleReturn,
  deleteSaleReturn,
};
