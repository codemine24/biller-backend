import {
  saleQueryValidationConfig,
  saleSearchableFields,
} from "./Sale.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreateSalePayload,
  UpdateSalePayload,
} from "./Sale.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { Prisma } from "../../../../prisma/generated";

// Helper function to generate unique invoice number
const generateInvoiceNumber = async (): Promise<string> => {
  const prefix = "SAL";
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  
  // Get count of sales today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const count = await prisma.sale.count({
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

// -------------------------------------- CREATE SALE -----------------------------------
const createSale = async (data: CreateSalePayload, user: TAuthUser) => {
  if (!user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }

  // Validate customer if provided
  if (data.customer_id) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customer_id,
        company_id: user.company_id,
      },
    });

    if (!customer) {
      throw new CustomizedError(httpStatus.NOT_FOUND, "Customer not found");
    }
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

  // Validate all products and check inventory
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

    // Check inventory availability
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
        `Insufficient inventory for product ${product.name}. Available: ${inventory?.quantity || 0}, Required: ${item.quantity}`
      );
    }
  }

  // Generate invoice number
  const invoice_number = await generateInvoiceNumber();

  // Calculate total_price for each item and subtotal
  const itemsWithTotal = data.items.map((item) => ({
    ...item,
    total_price: item.quantity * item.unit_price,
  }));

  const subtotal = itemsWithTotal.reduce((sum, item) => sum + Number(item.total_price), 0);
  
  // Ensure discount and tax have default values to prevent NaN
  const discount = data.discount || 0;
  const tax = data.tax || 0;
  
  // Calculate total_amount: subtotal - discount + tax
  const total_amount = subtotal - discount + tax;

  // Calculate paid_amount and due_amount
  const paid_amount = data.paid_amount || 0;
  const due_amount = total_amount - paid_amount;

  // Create sale with items in a transaction
  const sale = await prisma.$transaction(async (tx) => {
    // Create sale
    const newSale = await tx.sale.create({
      data: {
        invoice_number,
        store_id: data.store_id,
        customer_id: data.customer_id,
        sale_date: data.sale_date ? new Date(data.sale_date) : new Date(),
        subtotal,
        discount,
        tax,
        total_amount,
        paid_amount,
        due_amount,
        status: data.status,
        notes: data.notes,
        creator_id: user.id,
      },
      include: {
        customer: true,
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

    // Create sale items with calculated total_price
    await tx.saleItem.createMany({
      data: itemsWithTotal.map((item) => ({
        sale_id: newSale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    });

    // Deduct inventory for each sold product
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

    return newSale;
  });

  // Fetch sale with items
  const result = await prisma.sale.findUnique({
    where: { id: sale.id },
    include: {
      customer: true,
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

// -------------------------------------- GET SALES -------------------------------------
const getSales = async (user: TAuthUser, query: Record<string, any>) => {
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

  if (sort_by) queryValidator(saleQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(saleQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  // Build where conditions for company's sales
  const andConditions: Prisma.SaleWhereInput[] = [
    {
      store: {
        company_id: user.company_id,
      },
    },
  ];

  if (search_term) {
    andConditions.push({
      OR: saleSearchableFields.map((field) => {
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
      sale_date: {
        gte: date,
      },
    });
  }

  if (to_date) {
    const date = validDateChecker(to_date, "toDate");
    andConditions.push({
      sale_date: {
        lte: date,
      },
    });
  }

  if (Object.keys(remainingQuery).length) {
    for (const [key, value] of Object.entries(remainingQuery)) {
      queryValidator(saleQueryValidationConfig, key, value);
      andConditions.push({
        [key]: value.includes(",") ? { in: value.split(",") } : value,
      });
    }
  }

  const whereConditions = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.sale.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      include: {
        customer: true,
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
    prisma.sale.count({
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

// -------------------------------------- GET SALE (SINGLE) -----------------------------
const getSale = async (id: string, company_id: string) => {
  const result = await prisma.sale.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
    include: {
      customer: true,
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
    throw new CustomizedError(httpStatus.NOT_FOUND, "Sale not found");
  }

  return result;
};

// -------------------------------------- UPDATE SALE -----------------------------------
const updateSale = async (
  id: string,
  company_id: string,
  payload: UpdateSalePayload
) => {
  // Check if sale exists and belongs to company
  const existingSale = await prisma.sale.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
  });

  if (!existingSale) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Sale not found");
  }

  // Validate customer if provided
  if (payload.customer_id) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: payload.customer_id,
        company_id,
      },
    });

    if (!customer) {
      throw new CustomizedError(httpStatus.NOT_FOUND, "Customer not found");
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

  // Update sale with items in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update sale
    const updatedSale = await tx.sale.update({
      where: { id },
      data: {
        customer_id: payload.customer_id,
        store_id: payload.store_id,
        sale_date: payload.sale_date ? new Date(payload.sale_date) : undefined,
        subtotal: payload.subtotal,
        discount: payload.discount,
        tax: payload.tax,
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
      await tx.saleItem.deleteMany({
        where: { sale_id: id },
      });

      // Create new items
      const itemsWithTotal = payload.items.map((item) => ({
        ...item,
        total_price: item.quantity * item.unit_price,
      }));

      await tx.saleItem.createMany({
        data: itemsWithTotal.map((item) => ({
          sale_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      });
    }

    return updatedSale;
  });

  // Fetch updated sale with relations
  const updatedResult = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
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

// -------------------------------------- DELETE SALE -----------------------------------
const deleteSale = async (id: string, company_id: string) => {
  // Check if sale exists and belongs to company
  const existingSale = await prisma.sale.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
    include: {
      sale_returns: true,
    },
  });

  if (!existingSale) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Sale not found");
  }

  // Check if sale has returns
  if (existingSale.sale_returns.length > 0) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "Cannot delete sale with existing returns"
    );
  }

  // Delete sale (items will be deleted automatically due to cascade)
  await prisma.sale.delete({
    where: { id },
  });

  return { message: "Sale deleted successfully" };
};

export const SaleServices = {
  createSale,
  getSales,
  getSale,
  updateSale,
  deleteSale,
};
