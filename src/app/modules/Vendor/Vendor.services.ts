import {
  vendorQueryValidationConfig,
  vendorSearchableFields,
} from "./Vendor.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreateVendorPayload,
  UpdateVendorPayload,
} from "./Vendor.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { CompanyStatus, Prisma } from "../../../../prisma/generated";

// -------------------------------------- CREATE VENDOR -----------------------------------
const createVendor = async (data: CreateVendorPayload, user: TAuthUser) => {
  if (!user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }
  // Check if company exists
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: user.company_id, status: CompanyStatus.ACTIVE },
  });

  // Check for duplicate contact number within the same company
  const existingVendor = await prisma.vendor.findFirst({
    where: {
      contact_number: data.contact_number,
      company_id: company.id,
    },
  });

  if (existingVendor) {
    throw new CustomizedError(
      httpStatus.CONFLICT,
      "Vendor with this contact number already exists"
    );
  }

  // Create vendor
  const vendor = await prisma.vendor.create({
    data: {
      ...data,
      company_id: company.id,
    },
  });

  return vendor;
};

// -------------------------------------- GET VENDORS -------------------------------------
const getVendors = async (user: TAuthUser, query: Record<string, any>) => {
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

  if (sort_by) queryValidator(vendorQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(vendorQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.VendorWhereInput[] = [{company_id: user.company_id}];

  if (search_term) {
    andConditions.push({
      OR: vendorSearchableFields.map((field) => {
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
      queryValidator(vendorQueryValidationConfig, key, value);
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
    prisma.vendor.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
    }),
    prisma.vendor.count({
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

// -------------------------------------- GET VENDOR (SINGLE) -----------------------------
const getVendor = async (id: string, company_id: string) => {
  const result = await prisma.vendor.findFirst({
    where: {
      id,
      company_id,
      is_active: true,
    },
  });

  if (!result) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Vendor not found");
  }

  return result;
};

// -------------------------------------- UPDATE VENDOR -----------------------------------
const updateVendor = async (
  id: string,
  company_id: string,
  payload: UpdateVendorPayload
) => {
  // Check if vendor exists and belongs to company
  const existingVendor = await prisma.vendor.findFirst({
    where: {
      id,
      company_id,
    },
  });

  if (!existingVendor) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Vendor not found");
  }

  // Check for duplicate contact number if updating contact number
  if (payload.contact_number && payload.contact_number !== existingVendor.contact_number) {
    const duplicateVendor = await prisma.vendor.findFirst({
      where: {
        contact_number: payload.contact_number,
        company_id,
        id: { not: id },
      },
    });

    if (duplicateVendor) {
      throw new CustomizedError(
        httpStatus.CONFLICT,
        "Vendor with this contact number already exists"
      );
    }
  }

  // Update vendor
  const result = await prisma.vendor.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

// -------------------------------------- DELETE VENDOR -----------------------------------
const deleteVendor = async (id: string, company_id: string) => {
  // Check if vendor exists and belongs to company
  const existingVendor = await prisma.vendor.findFirst({
    where: {
      id,
      company_id,
    },
    include: {
      purchases: true,
    },
  });

  if (!existingVendor) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Vendor not found");
  }

  // Check if vendor has associated purchases
  if (existingVendor.purchases.length > 0) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "Cannot delete vendor with existing purchase records"
    );
  }

  // Delete vendor
  await prisma.vendor.delete({
    where: {
      id,
    },
  });

  return { message: "Vendor deleted successfully" };
};

export const VendorServices = {
  createVendor,
  getVendors,
  getVendor,
  updateVendor,
  deleteVendor,
};
