import {
  inventoryQueryValidationConfig,
  inventorySearchableFields,
} from "./Inventory.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreateInventoryPayload,
  UpdateInventoryPayload,
  AdjustInventoryPayload,
} from "./Inventory.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { Prisma } from "../../../../prisma/generated";

// -------------------------------------- GET INVENTORY -------------------------------------
const getInventory = async (user: TAuthUser, query: Record<string, any>) => {
  if (!user.company_id) {
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
    store_id,
    product_id,
    ...remainingQuery
  } = query;

  if (sort_by) queryValidator(inventoryQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(inventoryQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.InventoryWhereInput[] = [];

  // Filter by company through store relation
  andConditions.push({
    store: {
      company_id: user.company_id,
    },
  });

  if (search_term) {
    andConditions.push({
      product: {
        name: {
          contains: search_term.trim(),
          mode: "insensitive",
        },
      },
    });
  }

  if (store_id) {
    andConditions.push({
      store_id: store_id,
    });
  }

  if (product_id) {
    andConditions.push({
      product_id: product_id,
    });
  }

  // Note: low_stock filtering is handled by the dedicated getLowStockItems endpoint

  if (from_date) {
    const date = validDateChecker(from_date, "fromDate");
    andConditions.push({
      created_at: {
        gte: date,
      },
    });
  }

  if (to_date) {
    const date = validDateChecker(to_date, "toDate");
    andConditions.push({
      created_at: {
        lte: date,
      },
    });
  }

  if (Object.keys(remainingQuery).length) {
    for (const [key, value] of Object.entries(remainingQuery)) {
      queryValidator(inventoryQueryValidationConfig, key, value);
      andConditions.push({
        [key]:
          value === "true"
            ? true
            : value === "false"
            ? false
            : value.includes(",")
            ? { in: value.split(",") }
            : value,
      });
    }
  }

  const whereConditions = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.inventory.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            unit: true,
            cost_price: true,
            selling_price: true,
            reorder_level: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            brand: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    }),
    prisma.inventory.count({
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

// -------------------------------------- GET INVENTORY BY ID -------------------------------
const getInventoryById = async (id: string, company_id: string) => {
  const result = await prisma.inventory.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          unit: true,
          cost_price: true,
          selling_price: true,
          reorder_level: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      store: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });

  if (!result) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Inventory record not found");
  }

  return result;
};

// -------------------------------------- GET INVENTORY BY STORE ----------------------------
const getInventoryByStore = async (
  storeId: string,
  company_id: string,
  query: Record<string, any>
) => {
  // Verify store belongs to company
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      company_id,
    },
  });

  if (!store) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Store not found");
  }

  const { page, limit, sort_by, sort_order } = query;

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const [result, total] = await Promise.all([
    prisma.inventory.findMany({
      where: {
        store_id: storeId,
      },
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            unit: true,
            cost_price: true,
            selling_price: true,
            reorder_level: true,
          },
        },
      },
    }),
    prisma.inventory.count({
      where: {
        store_id: storeId,
      },
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

// -------------------------------------- GET INVENTORY BY PRODUCT --------------------------
const getInventoryByProduct = async (
  productId: string,
  company_id: string
) => {
  // Verify product belongs to company
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      company_id,
    },
  });

  if (!product) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Product not found");
  }

  const result = await prisma.inventory.findMany({
    where: {
      product_id: productId,
      store: {
        company_id,
      },
    },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });

  return result;
};

// -------------------------------------- GET LOW STOCK ITEMS -------------------------------
const getLowStockItems = async (user: TAuthUser, query: Record<string, any>) => {
  if (!user.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }

  const { page, limit, store_id } = query;

  const { pageNumber, limitNumber, skip } = paginationMaker({
    page,
    limit,
  });

  const whereConditions: Prisma.InventoryWhereInput = {
    store: {
      company_id: user.company_id,
    },
  };

  if (store_id) {
    whereConditions.store_id = store_id;
  }

  // Get all inventory items
  const inventoryItems = await prisma.inventory.findMany({
    where: whereConditions,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          unit: true,
          reorder_level: true,
          cost_price: true,
          selling_price: true,
        },
      },
      store: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });

  // Filter items where quantity is less than or equal to reorder_level
  const lowStockItems = inventoryItems.filter(
    (item) => item.quantity <= item.product.reorder_level
  );

  const total = lowStockItems.length;
  const paginatedItems = lowStockItems.slice(skip, skip + limitNumber);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
    data: paginatedItems,
  };
};

// -------------------------------------- CREATE INVENTORY ----------------------------------
const createInventory = async (
  data: CreateInventoryPayload,
  user: TAuthUser
) => {
  if (!user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }

  // Verify product belongs to company
  const product = await prisma.product.findFirst({
    where: {
      id: data.product_id,
      company_id: user.company_id,
    },
  });

  if (!product) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Product not found");
  }

  // Verify store belongs to company
  const store = await prisma.store.findFirst({
    where: {
      id: data.store_id,
      company_id: user.company_id,
    },
  });

  if (!store) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Store not found");
  }

  // Check if inventory record already exists
  const existingInventory = await prisma.inventory.findFirst({
    where: {
      product_id: data.product_id,
      store_id: data.store_id,
    },
  });

  if (existingInventory) {
    throw new CustomizedError(
      httpStatus.CONFLICT,
      "Inventory record already exists for this product and store"
    );
  }

  // Create inventory record
  const inventory = await prisma.inventory.create({
    data: {
      product_id: data.product_id,
      store_id: data.store_id,
      quantity: data.quantity,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          unit: true,
        },
      },
      store: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return inventory;
};

// -------------------------------------- UPDATE INVENTORY ----------------------------------
const updateInventory = async (
  id: string,
  company_id: string,
  payload: UpdateInventoryPayload
) => {
  // Check if inventory exists and belongs to company
  const existingInventory = await prisma.inventory.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
  });

  if (!existingInventory) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Inventory record not found");
  }

  // Update inventory
  const result = await prisma.inventory.update({
    where: {
      id,
    },
    data: {
      quantity: payload.quantity,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          unit: true,
        },
      },
      store: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return result;
};

// -------------------------------------- ADJUST INVENTORY ----------------------------------
const adjustInventory = async (
  id: string,
  company_id: string,
  payload: AdjustInventoryPayload
) => {
  // Check if inventory exists and belongs to company
  const existingInventory = await prisma.inventory.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
  });

  if (!existingInventory) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Inventory record not found");
  }

  const newQuantity = existingInventory.quantity + payload.adjustment_quantity;

  if (newQuantity < 0) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "Adjustment would result in negative inventory"
    );
  }

  // Update inventory with adjustment
  const result = await prisma.inventory.update({
    where: {
      id,
    },
    data: {
      quantity: newQuantity,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          unit: true,
        },
      },
      store: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Note: In a production system, you might want to log the adjustment
  // with the reason in a separate audit table

  return result;
};

// -------------------------------------- DELETE INVENTORY ----------------------------------
const deleteInventory = async (id: string, company_id: string) => {
  // Check if inventory exists and belongs to company
  const existingInventory = await prisma.inventory.findFirst({
    where: {
      id,
      store: {
        company_id,
      },
    },
  });

  if (!existingInventory) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Inventory record not found");
  }

  // Delete inventory
  await prisma.inventory.delete({
    where: {
      id,
    },
  });

  return { message: "Inventory record deleted successfully" };
};

export const InventoryServices = {
  getInventory,
  getInventoryById,
  getInventoryByStore,
  getInventoryByProduct,
  getLowStockItems,
  createInventory,
  updateInventory,
  adjustInventory,
  deleteInventory,
};
