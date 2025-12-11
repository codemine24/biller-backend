import {
  customerQueryValidationConfig,
  customerSearchableFields,
} from "./Customer.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "./Customer.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { CompanyStatus, Prisma } from "../../../../prisma/generated";

// -------------------------------------- CREATE CUSTOMER -----------------------------------
const createCustomer = async (data: CreateCustomerPayload, user: TAuthUser) => {
  console.log(user);
  if (!user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }
  // Check if company exists
  const company =await prisma.company.findUniqueOrThrow({
    where: { id: user.company_id, status: CompanyStatus.ACTIVE },
  });

  // Check for duplicate contact number within the same company
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      contact_number: data.contact_number,
      company_id: company.id,
    },
  });

  if (existingCustomer) {
    throw new CustomizedError(
      httpStatus.CONFLICT,
      "Customer with this contact number already exists"
    );
  }

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      ...data,
      company_id: company.id,
    },
  });

  return customer;
};

// -------------------------------------- GET CUSTOMERS -------------------------------------
const getCustomers = async (user: TAuthUser, query: Record<string, any>) => {
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

  if (sort_by) queryValidator(customerQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(customerQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.CustomerWhereInput[] = [{company_id: user.company_id}];

  if (search_term) {
    andConditions.push({
      OR: customerSearchableFields.map((field) => {
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
      queryValidator(customerQueryValidationConfig, key, value);
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
    prisma.customer.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
    }),
    prisma.customer.count({
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

// -------------------------------------- GET CUSTOMER (SINGLE) -----------------------------
const getCustomer = async (id: string, company_id: string) => {
  const result = await prisma.customer.findFirst({
    where: {
      id,
      company_id,
      is_active: true,
    },
  });

  if (!result) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Customer not found");
  }

  return result;
};

// -------------------------------------- UPDATE CUSTOMER -----------------------------------
const updateCustomer = async (
  id: string,
  company_id: string,
  payload: UpdateCustomerPayload
) => {
  // Check if customer exists and belongs to subscriber
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id,
      company_id,
    },
  });

  if (!existingCustomer) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Customer not found");
  }

  // Check for duplicate contact number if updating contact number
  if (payload.contact_number && payload.contact_number !== existingCustomer.contact_number) {
    const duplicateCustomer = await prisma.customer.findFirst({
      where: {
        contact_number: payload.contact_number,
        company_id,
        id: { not: id },
      },
    });

    if (duplicateCustomer) {
      throw new CustomizedError(
        httpStatus.CONFLICT,
        "Customer with this contact number already exists"
      );
    }
  }

  // Update customer
  const result = await prisma.customer.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

// -------------------------------------- DELETE CUSTOMER -----------------------------------
const deleteCustomer = async (id: string, company_id: string) => {
  // Check if customer exists and belongs to subscriber
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id,
      company_id,
    },
    include: {
      sales: true,
    },
  });

  if (!existingCustomer) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Customer not found");
  }

  // Check if customer has associated sales
  if (existingCustomer.sales.length > 0) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "Cannot delete customer with existing sales records"
    );
  }

  // Delete customer
  await prisma.customer.delete({
    where: {
      id,
    },
  });

  return { message: "Customer deleted successfully" };
};

export const CustomerServices = {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
};
