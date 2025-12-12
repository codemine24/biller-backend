import {
  categoryQueryValidationConfig,
  categorySearchableFields,
} from "./Category.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./Category.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { Prisma, UserRole } from "../../../../prisma/generated";
import { slugGenerator } from "../../utils/slug-generator";

// -------------------------------------- CREATE CATEGORY -----------------------------------
const createCategory = async (data: CreateCategoryPayload, user: TAuthUser) => {
  if (user.role !== UserRole.SUPER_ADMIN && !user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }

  // Generate slug from name if not provided
  const slug = data.slug || slugGenerator(data.name);

  // Check for duplicate name
  const existingCategoryByName = await prisma.category.findFirst({
    where: {
      name: data.name,
      ...(user.company_id && {company_id: user.company_id})
    },
  });

  if (existingCategoryByName) {
    throw new CustomizedError(
      httpStatus.CONFLICT,
      "Category with this name already exists"
    );
  }

  // Check for duplicate slug
  const existingCategoryBySlug = await prisma.category.findFirst({
    where: {
      slug: slug,
      ...(user.company_id && {company_id: user.company_id})
    },
  });

  if (existingCategoryBySlug) {
    throw new CustomizedError(
      httpStatus.CONFLICT,
      "Category with this slug already exists"
    );
  }

  // Create category
  const category = await prisma.category.create({
    data: {
      ...data,
      slug,
      ...(user.company_id && {company_id: user.company_id})
    },
  });

  return category;
};

// -------------------------------------- GET CATEGORIES -------------------------------------
const getCategories = async (user: TAuthUser, query: Record<string, any>) => {
  if (user.role !== UserRole.SUPER_ADMIN && !user?.company_id) {
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

  if (sort_by) queryValidator(categoryQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(categoryQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.CategoryWhereInput[] = user.company_id ? [{company_id: user.company_id}] : [];

  if (search_term) {
    andConditions.push({
      OR: categorySearchableFields.map((field) => {
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
      queryValidator(categoryQueryValidationConfig, key, value);
      andConditions.push({
        [key]: value.includes(",") ? { in: value.split(",") } : value,
      });
    }
  }

  const whereConditions = andConditions.length > 0 ? {
    AND: andConditions,
  } : {};

  const [result, total] = await Promise.all([
    prisma.category.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
    }),
    prisma.category.count({
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

// -------------------------------------- GET CATEGORY (SINGLE) -----------------------------
const getCategory = async (id: string, company_id: string | null) => {
  const result = await prisma.category.findFirst({
    where: {
      id,
      ...(company_id && {company_id})
    },
  });

  if (!result) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Category not found");
  }

  return result;
};

// -------------------------------------- UPDATE CATEGORY -----------------------------------
const updateCategory = async (
  id: string,
  company_id: string | null,
  payload: UpdateCategoryPayload
) => {
  // Check if category exists and belongs to company
  const existingCategory = await prisma.category.findFirst({
    where: {
      id,
      ...(company_id && {company_id})
    },
  });

  if (!existingCategory) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Category not found");
  }

  // Auto-generate slug if name is being updated but slug is not provided
  if (payload.name && !payload.slug && payload.name !== existingCategory.name) {
    payload.slug = slugGenerator(payload.name);
  }

  // Check for duplicate name if updating name
  if (payload.name && payload.name !== existingCategory.name) {
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: payload.name,
        ...(company_id && {company_id}),
        id: { not: id },
      },
    });

    if (duplicateCategory) {
      throw new CustomizedError(
        httpStatus.CONFLICT,
        "Category with this name already exists"
      );
    }
  }

  // Check for duplicate slug if updating slug
  if (payload.slug && payload.slug !== existingCategory.slug) {
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        slug: payload.slug,
        ...(company_id && {company_id}),
        id: { not: id },
      },
    });

    if (duplicateCategory) {
      throw new CustomizedError(
        httpStatus.CONFLICT,
        "Category with this slug already exists"
      );
    }
  }

  // Update category
  const result = await prisma.category.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

// -------------------------------------- DELETE CATEGORY -----------------------------------
const deleteCategory = async (id: string, company_id: string | null) => {
  // Check if category exists and belongs to company
  const existingCategory = await prisma.category.findFirst({
    where: {
      id,
      ...(company_id && {company_id})
    },
    include: {
      products: true,
    },
  });

  if (!existingCategory) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Category not found");
  }

  // Check if category has associated products
  if (existingCategory.products.length > 0) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "Cannot delete category with existing products"
    );
  }

  // Delete category
  await prisma.category.delete({
    where: {
      id,
    },
  });

  return { message: "Category deleted successfully" };
};

export const CategoryServices = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
