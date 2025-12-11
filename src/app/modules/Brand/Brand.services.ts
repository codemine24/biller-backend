import {
  brandQueryValidationConfig,
  brandSearchableFields,
} from "./Brand.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreateBrandPayload,
  UpdateBrandPayload,
} from "./Brand.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { Prisma, UserRole } from "../../../../prisma/generated";

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// -------------------------------------- CREATE BRAND -----------------------------------
const createBrand = async (data: CreateBrandPayload, user: TAuthUser) => {
  if (user.role !== UserRole.SUPER_ADMIN && !user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }

  // Generate slug from name if not provided
  const slug = data.slug || generateSlug(data.name);

  // Check for duplicate name
  const existingBrandByName = await prisma.brand.findFirst({
    where: {
      name: data.name,
      ...(user.company_id && {company_id: user.company_id})
    },
  });

  if (existingBrandByName) {
    throw new CustomizedError(
      httpStatus.CONFLICT,
      "Brand with this name already exists"
    );
  }

  // Check for duplicate slug
  const existingBrandBySlug = await prisma.brand.findFirst({
    where: {
      slug: slug,
      ...(user.company_id && {company_id: user.company_id})
    },
  });

  if (existingBrandBySlug) {
    throw new CustomizedError(
      httpStatus.CONFLICT,
      "Brand with this slug already exists"
    );
  }

  // Create brand
  const brand = await prisma.brand.create({
    data: {
      ...data,
      slug,
      ...(user.company_id && {company_id: user.company_id})
    },
  });

  return brand;
};

// -------------------------------------- GET BRANDS -------------------------------------
const getBrands = async (user: TAuthUser, query: Record<string, any>) => {
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

  if (sort_by) queryValidator(brandQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(brandQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.BrandWhereInput[] = user.company_id ? [{company_id: user.company_id}] : [];

  if (search_term) {
    andConditions.push({
      OR: brandSearchableFields.map((field) => {
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
      queryValidator(brandQueryValidationConfig, key, value);
      andConditions.push({
        [key]: value.includes(",") ? { in: value.split(",") } : value,
      });
    }
  }

  const whereConditions = andConditions.length > 0 ? {
    AND: andConditions,
  } : {};

  const [result, total] = await Promise.all([
    prisma.brand.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
    }),
    prisma.brand.count({
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

// -------------------------------------- GET BRAND (SINGLE) -----------------------------
const getBrand = async (id: string, company_id: string | null) => {
  const result = await prisma.brand.findFirst({
    where: {
      id,
      ...(company_id && {company_id})
    },
  });

  if (!result) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Brand not found");
  }

  return result;
};

// -------------------------------------- UPDATE BRAND -----------------------------------
const updateBrand = async (
  id: string,
  company_id: string | null,
  payload: UpdateBrandPayload
) => {
  // Check if brand exists and belongs to company
  const existingBrand = await prisma.brand.findFirst({
    where: {
      id,
      ...(company_id && {company_id})
    },
  });

  if (!existingBrand) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Brand not found");
  }

  // Auto-generate slug if name is being updated but slug is not provided
  if (payload.name && !payload.slug && payload.name !== existingBrand.name) {
    payload.slug = generateSlug(payload.name);
  }

  // Check for duplicate name if updating name
  if (payload.name && payload.name !== existingBrand.name) {
    const duplicateBrand = await prisma.brand.findFirst({
      where: {
        name: payload.name,
        ...(company_id && {company_id}),
        id: { not: id },
      },
    });

    if (duplicateBrand) {
      throw new CustomizedError(
        httpStatus.CONFLICT,
        "Brand with this name already exists"
      );
    }
  }

  // Check for duplicate slug if updating slug
  if (payload.slug && payload.slug !== existingBrand.slug) {
    const duplicateBrand = await prisma.brand.findFirst({
      where: {
        slug: payload.slug,
        ...(company_id && {company_id}),
        id: { not: id },
      },
    });

    if (duplicateBrand) {
      throw new CustomizedError(
        httpStatus.CONFLICT,
        "Brand with this slug already exists"
      );
    }
  }

  // Update brand
  const result = await prisma.brand.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

// -------------------------------------- DELETE BRAND -----------------------------------
const deleteBrand = async (id: string, company_id: string | null) => {
  // Check if brand exists and belongs to company
  const existingBrand = await prisma.brand.findFirst({
    where: {
      id,
      ...(company_id && {company_id})
    },
    include: {
      products: true,
    },
  });

  if (!existingBrand) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Brand not found");
  }

  // Check if brand has associated products
  if (existingBrand.products.length > 0) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "Cannot delete brand with existing products"
    );
  }

  // Delete brand
  await prisma.brand.delete({
    where: {
      id,
    },
  });

  return { message: "Brand deleted successfully" };
};

export const BrandServices = {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
};
