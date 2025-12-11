import {
  companyQueryValidationConfig,
  companySearchableFields,
} from "./Company.constants";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreateCompanyPayload,
  UpdateCompanyBySuperAdminPayload,
  UpdateCompanyBySelfPayload,
} from "./Company.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { Prisma } from "../../../../prisma/generated";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE COMPANY -----------------------------------------
const createCompany = async (data: CreateCompanyPayload, user: TAuthUser) => {
  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data,
    });

    await tx.store.create({
      data: {
        name: data.name,
        contact_number: data.contact_number,
        address: data.address,
        company_id: company.id,
      },
    });

    await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        company_id: company.id,
      },
    })

    return company;
  });

  return result;
};

// -------------------------------------- GET COMPANIES -------------------------------------------
const getCompanies = async (query: Record<string, any>) => {
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

  if (sort_by) queryValidator(companyQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(companyQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.CompanyWhereInput[] = [];

  if (search_term) {
    andConditions.push({
      OR: companySearchableFields.map((field) => {
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
      queryValidator(companyQueryValidationConfig, key, value);
      andConditions.push({
        [key]: value.includes(",")
          ? { in: value.split(",") }
          : value,
      });
    }
  }

  const whereConditions = andConditions.length > 0 ? {
    AND: andConditions,
  } : {};

  const [result, total] = await Promise.all([
    prisma.company.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
    }),
    prisma.company.count({
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

// -------------------------------------- GET COMPANY (SINGLE) -----------------------------------
const getCompany = async (id: string) => {
  const result = await prisma.company.findUnique({
    where: {
      id,
    },
  });

  if (!result) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Company not found");
  }

  return result;
};

// -------------------------------------- UPDATE COMPANY BY SUPER ADMIN -------------------------
const updateCompanyBySuperAdmin = async (
  id: string,
  payload: UpdateCompanyBySuperAdminPayload
) => {
  // Check if company exists
  const existingCompany = await prisma.company.findUnique({
    where: {
      id,
    },
  });

  if (!existingCompany) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Company not found");
  }

  // Update company
  const result = await prisma.company.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

// -------------------------------------- UPDATE COMPANY BY SELF ---------------------------------
const updateCompanyBySelf = async (
  id: string,
  payload: UpdateCompanyBySelfPayload
) => {
  // Check if company exists
  const existingCompany = await prisma.company.findUnique({
    where: {
      id,
    },
  });

  if (!existingCompany) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Company not found");
  }

  // Check for duplicate name if updating name
  if (payload.name && payload.name !== existingCompany.name) {
    const duplicateCompany = await prisma.company.findFirst({
      where: {
        name: payload.name,
        id: { not: id },
      },
    });

    if (duplicateCompany) {
      throw new CustomizedError(
        httpStatus.CONFLICT,
        "Company with this name already exists"
      );
    }
  }

  // Update company
  const result = await prisma.company.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

// -------------------------------------- DELETE COMPANY -----------------------------------------
const deleteCompany = async (id: string) => {
  // Check if company exists
  const existingCompany = await prisma.company.findUnique({
    where: {
      id,
    },
    include: {
      users: true,
      stores: true,
      categories: true,
      products: true,
      customers: true,
      vendors: true,
      brands: true,
    },
  });

  if (!existingCompany) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Company not found");
  }

  // Check if company has associated data
  const hasAssociatedData =
    existingCompany.users.length > 0 ||
    existingCompany.stores.length > 0 ||
    existingCompany.categories.length > 0 ||
    existingCompany.products.length > 0 ||
    existingCompany.customers.length > 0 ||
    existingCompany.vendors.length > 0 ||
    existingCompany.brands.length > 0;

  if (hasAssociatedData) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "Cannot delete company with existing associated data (users, stores, products, etc.)"
    );
  }

  // Delete company
  await prisma.company.delete({
    where: {
      id,
    },
  });

  return { message: "Company deleted successfully" };
};

export const CompanyServices = {
  createCompany,
  getCompanies,
  getCompany,
  updateCompanyBySuperAdmin,
  updateCompanyBySelf,
  deleteCompany,
};
