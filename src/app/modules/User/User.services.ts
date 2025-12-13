import {
  userQueryValidationConfig,
  userSearchableFields,
  userSelectedFields,
} from "./User.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreateUserPayload,
  UpdateUserPayload,
} from "./User.interfaces";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { Prisma } from "../../../../prisma/generated";
import bcrypt from "bcrypt";
import config from "../../config";

// -------------------------------------- CREATE USER -----------------------------------
const createUser = async (data: CreateUserPayload, user: TAuthUser) => {
  // Hash password
  const hashedPassword = await bcrypt.hash(
      data.password,
      Number(config.salt_rounds)
    );

  // Determine company_id
  let company_id = user.company_id;

  // Role-based user creation validation
  // 1. SUPER_ADMIN can create SUPER_ADMIN
  // 2. OWNER can create ADMIN, BRANCH_MANAGER, and SALESMAN
  // 3. ADMIN can create BRANCH_MANAGER and SALESMAN
  // 4. BRANCH_MANAGER can create SALESMAN
  const roleHierarchy: Record<string, string[]> = {
    SUPER_ADMIN: ["SUPER_ADMIN"],
    OWNER: ["ADMIN", "BRANCH_MANAGER", "SALESMAN"],
    ADMIN: ["BRANCH_MANAGER", "SALESMAN"],
    BRANCH_MANAGER: ["SALESMAN"],
  };

  const allowedRoles = roleHierarchy[user.role] || [];
  
  if (!allowedRoles.includes(data.role)) {
    throw new CustomizedError(
      httpStatus.FORBIDDEN,
      `${user.role} can only create users with roles: ${allowedRoles.join(", ")}`
    );
  }

  // Create user
  const newUser = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      contact_number: data.contact_number,
      password: hashedPassword,
      avatar: data.avatar,
      role: data.role,
      company_id,
    },
    select: {
      ...userSelectedFields
    },
  });

  return newUser;
};

// -------------------------------------- GET USERS -------------------------------------
const getUsers = async (user: TAuthUser, query: Record<string, any>) => {
  const {
    search_term,
    page,
    limit,
    sort_by,
    sort_order,
    ...remainingQuery
  } = query;

  if (sort_by) queryValidator(userQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(userQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  // Build where conditions
  const andConditions: Prisma.UserWhereInput[] = [
    { is_deleted: false },
  ];

  // SUPER_ADMIN can see all users, others can only see users from their company
  if (user.role !== "SUPER_ADMIN") {
    if (!user.company_id) {
      throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
    }
    andConditions.push({ company_id: user.company_id });
  }

  if (search_term) {
    andConditions.push({
      OR: userSearchableFields.map((field) => {
        return {
          [field]: {
            contains: search_term.trim(),
            mode: "insensitive",
          },
        };
      }),
    });
  }

  if (Object.keys(remainingQuery).length) {
    for (const [key, value] of Object.entries(remainingQuery)) {
      queryValidator(userQueryValidationConfig, key, value);
      andConditions.push({
        [key]: value.includes(",") ? { in: value.split(",") } : value,
      });
    }
  }

  const whereConditions = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.user.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      select: {
        id: true,
        name: true,
        email: true,
        contact_number: true,
        avatar: true,
        role: true,
        status: true,
        company_id: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.user.count({
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

// -------------------------------------- GET USER (SINGLE) -----------------------------
const getUser = async (id: string, user: TAuthUser) => {
  const result = await prisma.user.findFirst({
    where: {
      id,
      is_deleted: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      contact_number: true,
      avatar: true,
      role: true,
      status: true,
      company_id: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!result) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "User not found");
  }

  // SUPER_ADMIN can view any user, others can only view users from their company
  if (user.role !== "SUPER_ADMIN" && result.company_id !== user.company_id) {
    throw new CustomizedError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view this user"
    );
  }

  return result;
};

// -------------------------------------- UPDATE USER -----------------------------------
const updateUser = async (
  id: string,
  user: TAuthUser,
  payload: UpdateUserPayload
) => {
  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      is_deleted: false,
    },
  });

  if (!existingUser) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "User not found");
  }

  // Authorization check
  if (user.role !== "SUPER_ADMIN") {
    // Users can only update users from their own company
    if (existingUser.company_id !== user.company_id) {
      throw new CustomizedError(
        httpStatus.FORBIDDEN,
        "You are not authorized to update this user"
      );
    }

    // Only OWNER and ADMIN can update other users
    if (id !== user.id && !["OWNER", "ADMIN"].includes(user.role)) {
      throw new CustomizedError(
        httpStatus.FORBIDDEN,
        "You are not authorized to update other users"
      );
    }
  }

  // Check email uniqueness if updating email
  if (payload.email && payload.email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (emailExists) {
      throw new CustomizedError(
        httpStatus.CONFLICT,
        "User with this email already exists"
      );
    }
  }

  // Check contact number uniqueness if updating contact number
  if (payload.contact_number && payload.contact_number !== existingUser.contact_number) {
    const contactExists = await prisma.user.findUnique({
      where: { contact_number: payload.contact_number },
    });

    if (contactExists) {
      throw new CustomizedError(
        httpStatus.CONFLICT,
        "User with this contact number already exists"
      );
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: payload.name,
      email: payload.email,
      contact_number: payload.contact_number,
      avatar: payload.avatar,
      role: payload.role,
      status: payload.status,
    },
    select: {
      id: true,
      name: true,
      email: true,
      contact_number: true,
      avatar: true,
      role: true,
      status: true,
      company_id: true,
      created_at: true,
      updated_at: true,
    },
  });

  return updatedUser;
};

// -------------------------------------- DELETE USER -----------------------------------
const deleteUser = async (id: string, user: TAuthUser) => {
  // Only SUPER_ADMIN, OWNER, and ADMIN can delete users
  if (!["SUPER_ADMIN", "OWNER", "ADMIN"].includes(user.role)) {
    throw new CustomizedError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete users"
    );
  }

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      is_deleted: false,
    },
  });

  if (!existingUser) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "User not found");
  }

  // Authorization check
  if (user.role !== "SUPER_ADMIN" && existingUser.company_id !== user.company_id) {
    throw new CustomizedError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this user"
    );
  }

  // Prevent self-deletion
  if (id === user.id) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "You cannot delete yourself"
    );
  }

  // Soft delete user
  await prisma.user.update({
    where: { id },
    data: { is_deleted: true },
  });

  return { message: "User deleted successfully" };
};

export const UserServices = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
