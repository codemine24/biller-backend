import {
  productQueryValidationConfig,
  productSearchableFields,
} from "./Product.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreateProductPayload,
  UpdateProductPayload,
} from "./Product.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { CompanyStatus, Prisma, UserRole } from "../../../../prisma/generated";

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

// -------------------------------------- CREATE PRODUCT -----------------------------------
const createProduct = async (data: CreateProductPayload, user: TAuthUser) => {
  if (user.role !== UserRole.SUPER_ADMIN && !user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }

  // Generate slug from name if not provided
  const slug = data.slug || generateSlug(data.name);

  // Check for duplicate name within the same company
  const existingProductByName = await prisma.product.findFirst({
    where: {
      name: data.name,
      ...(user.company_id && {company_id: user.company_id})
    },
  });

  if (existingProductByName) {
    throw new CustomizedError(
      httpStatus.CONFLICT,
      "Product with this name already exists"
    );
  }

  // Check for duplicate slug within the same company
  const existingProductBySlug = await prisma.product.findFirst({
    where: {
      slug: slug,
      ...(user.company_id && {company_id: user.company_id})
    },
  });

  if (existingProductBySlug) {
    throw new CustomizedError(
      httpStatus.CONFLICT,
      "Product with this slug already exists"
    );
  }

  // Validate category if provided
  if (data.category_id) {
    await prisma.category.findUniqueOrThrow({
      where: { id: data.category_id, ...(user.company_id && {company_id: user.company_id}) },
    });
  }

  // Validate brand if provided
  if (data.brand_id) {
    await prisma.brand.findUniqueOrThrow({
      where: { id: data.brand_id, ...(user.company_id && {company_id: user.company_id}) },
    });
  }

  // Create product
  const product = await prisma.product.create({
    data: {
      ...data,
      slug,
      ...(user.company_id && {company_id: user.company_id})
    },
    include: {
      category: true,
      brand: true,
    },
  });

  return product;
};

// -------------------------------------- GET PRODUCTS -------------------------------------
const getProducts = async (user: TAuthUser, query: Record<string, any>) => {
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

  if (sort_by) queryValidator(productQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(productQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.ProductWhereInput[] = [{company_id: user.company_id}];

  if (search_term) {
    andConditions.push({
      OR: productSearchableFields.map((field) => {
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
      queryValidator(productQueryValidationConfig, key, value);
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
    prisma.product.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      include: {
        category: true,
        brand: true,
      },
    }),
    prisma.product.count({
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

// -------------------------------------- GET PRODUCT (SINGLE) -----------------------------
const getProduct = async (id: string, company_id: string) => {
  const result = await prisma.product.findFirst({
    where: {
      id,
      company_id,
    },
    include: {
      category: true,
      brand: true,
    },
  });

  if (!result) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Product not found");
  }

  return result;
};

// -------------------------------------- UPDATE PRODUCT -----------------------------------
const updateProduct = async (
  id: string,
  company_id: string,
  payload: UpdateProductPayload
) => {
  // Check if product exists and belongs to company
  const existingProduct = await prisma.product.findFirst({
    where: {
      id,
      company_id,
    },
  });

  if (!existingProduct) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Product not found");
  }

  // Auto-generate slug if name is being updated but slug is not provided
  if (payload.name && !payload.slug && payload.name !== existingProduct.name) {
    payload.slug = generateSlug(payload.name);
  }

  // Check for duplicate name if updating name
  if (payload.name && payload.name !== existingProduct.name) {
    const duplicateProduct = await prisma.product.findFirst({
      where: {
        name: payload.name,
        company_id,
        id: { not: id },
      },
    });

    if (duplicateProduct) {
      throw new CustomizedError(
        httpStatus.CONFLICT,
        "Product with this name already exists"
      );
    }
  }

  // Check for duplicate slug if updating slug
  if (payload.slug && payload.slug !== existingProduct.slug) {
    const duplicateProduct = await prisma.product.findFirst({
      where: {
        slug: payload.slug,
        company_id,
        id: { not: id },
      },
    });

    if (duplicateProduct) {
      throw new CustomizedError(
        httpStatus.CONFLICT,
        "Product with this slug already exists"
      );
    }
  }

  // Validate category if provided
  if (payload.category_id) {
    await prisma.category.findUniqueOrThrow({
      where: { id: payload.category_id, company_id },
    });
  }

  // Validate brand if provided
  if (payload.brand_id) {
    await prisma.brand.findUniqueOrThrow({
      where: { id: payload.brand_id, company_id },
    });
  }

  // Update product
  const result = await prisma.product.update({
    where: {
      id,
    },
    data: payload,
    include: {
      category: true,
      brand: true,
    },
  });

  return result;
};

// -------------------------------------- DELETE PRODUCT -----------------------------------
const deleteProduct = async (id: string, company_id: string) => {
  // Check if product exists and belongs to company
  const existingProduct = await prisma.product.findFirst({
    where: {
      id,
      company_id,
    },
    include: {
      inventory: true,
      purchase_items: true,
      sale_items: true,
    },
  });

  if (!existingProduct) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Product not found");
  }

  // Check if product has associated records
  const hasAssociatedRecords =
    existingProduct.inventory.length > 0 ||
    existingProduct.purchase_items.length > 0 ||
    existingProduct.sale_items.length > 0;

  if (hasAssociatedRecords) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "Cannot delete product with existing inventory, purchase, or sale records"
    );
  }

  // Delete product
  await prisma.product.delete({
    where: {
      id,
    },
  });

  return { message: "Product deleted successfully" };
};

export const ProductServices = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
