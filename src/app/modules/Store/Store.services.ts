import {
  storeQueryValidationConfig,
  storeSearchableFields,
} from "./Store.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreateStorePayload,
  UpdateStorePayload,
} from "./Store.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { CompanyStatus, Prisma } from "../../../../prisma/generated";

// -------------------------------------- CREATE STORE -----------------------------------
const createStore = async (data: CreateStorePayload, user: TAuthUser) => {
  if (!user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }

  // Check if company exists
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: user.company_id, status: CompanyStatus.ACTIVE },
  });

  // Check for duplicate name within the same company
  const existingStore = await prisma.store.findFirst({
    where: {
      name: data.name,
      company_id: company.id,
    },
  });

  if (existingStore) {
    throw new CustomizedError(
      httpStatus.CONFLICT,
      "Store with this name already exists"
    );
  }

  // Create store
  const store = await prisma.store.create({
    data: {
      ...data,
      company_id: company.id,
    },
  });

  return store;
};

// -------------------------------------- GET STORES -------------------------------------
const getStores = async (user: TAuthUser, query: Record<string, any>) => {
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

  if (sort_by) queryValidator(storeQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(storeQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.StoreWhereInput[] = [{company_id: user.company_id}];

  if (search_term) {
    andConditions.push({
      OR: storeSearchableFields.map((field) => {
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
      queryValidator(storeQueryValidationConfig, key, value);
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
    prisma.store.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
    }),
    prisma.store.count({
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

// -------------------------------------- GET STORE (SINGLE) -----------------------------
const getStore = async (id: string, company_id: string) => {
  const result = await prisma.store.findFirst({
    where: {
      id,
      company_id,
    },
  });

  if (!result) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Store not found");
  }

  return result;
};

// -------------------------------------- UPDATE STORE -----------------------------------
const updateStore = async (
  id: string,
  company_id: string,
  payload: UpdateStorePayload
) => {
  // Check if store exists and belongs to company
  const existingStore = await prisma.store.findFirst({
    where: {
      id,
      company_id,
    },
  });

  if (!existingStore) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Store not found");
  }

  // Check for duplicate name if updating name
  if (payload.name && payload.name !== existingStore.name) {
    const duplicateStore = await prisma.store.findFirst({
      where: {
        name: payload.name,
        company_id,
        id: { not: id },
      },
    });

    if (duplicateStore) {
      throw new CustomizedError(
        httpStatus.CONFLICT,
        "Store with this name already exists"
      );
    }
  }

  // Update store
  const result = await prisma.store.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

// -------------------------------------- DELETE STORE -----------------------------------
const deleteStore = async (id: string, company_id: string) => {
  // Check if store exists and belongs to company
  const existingStore = await prisma.store.findFirst({
    where: {
      id,
      company_id,
    },
    include: {
      inventory: true,
      purchases: true,
      sales: true,
    },
  });

  if (!existingStore) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Store not found");
  }

  // Check if store has associated records
  const hasAssociatedRecords =
    existingStore.inventory.length > 0 ||
    existingStore.purchases.length > 0 ||
    existingStore.sales.length > 0;

  if (hasAssociatedRecords) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "Cannot delete store with existing inventory, purchase, or sale records"
    );
  }

  // Delete store
  await prisma.store.delete({
    where: {
      id,
    },
  });

  return { message: "Store deleted successfully" };
};

export const StoreServices = {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore,
};
