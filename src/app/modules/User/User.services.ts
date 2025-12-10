import {
  userQueryValidationConfig,
  userSearchableFields,
  userSelectedFields,
} from "./User.constants";
import { TAuthUser } from "../../interfaces/common";
import { TFile } from "../../interfaces/file";
import ApiError from "../../error/api-error";
import httpStatus from "http-status";
import {
  AddUserByAdminPayload,
  UpdateUserByAdminPayload,
} from "./User.interfaces";
import sharp from "sharp";
import supabase from "../../shared/supabase";
import config from "../../../config";
import bcrypt from "bcrypt";
import sendEmail from "../../utils/email-sender";
import sendSMS from "../../utils/sms-sender";
import { credentialMailTemplate } from "../../template/credential-mail-template";
import { validDateChecker } from "../../utils/checker";
import { prisma } from "../../shared/prisma";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { Prisma, UserRole, UserStatus } from "../../../generated/prisma/client";
import { passwordGenerator } from "../../utils/password-generator";

// -------------------------------------- ADD USER BY ADMIN ---------------------------------
const addUserByAdmin = async (data: AddUserByAdminPayload) => {
  // generate password
  const generatedPassword = passwordGenerator(6);
  const hashedPassword = await bcrypt.hash(
    generatedPassword,
    Number(config.salt_rounds)
  );

  const SMSBody = `Dear ${
    data.name || "customer"
  }, your crerdentials is: \nEmail: ${data.email || ""} \nContact Number: ${
    data.contact_number
  }  \nPassword: ${generatedPassword} \nChange your password after login \n${
    config.app_name
  }`;

  const emailBody = credentialMailTemplate({
    name: data.name,
    contact_number: data.contact_number,
    email: data.email,
    password: generatedPassword,
  });

  let emailResponse;
  if (data.email) {
    emailResponse = await sendEmail(data.email, emailBody, "User credentials");
  }

  const SMSResponse = await sendSMS(data.contact_number, SMSBody);

  if (emailResponse?.accepted?.length === 0 && SMSResponse.success === false)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to send use cradentials"
    );

  // create user
  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: {
      ...userSelectedFields,
    },
  });

  return user;
};

// -------------------------------------- GET USERS -----------------------------------------
const getUsers = async (user: TAuthUser, query: Record<string, any>) => {
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

  const andConditions: Prisma.UserWhereInput[] = [
    { is_deleted: false, id: { not: user.id } },
  ];

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
      queryValidator(userQueryValidationConfig, key, value);
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

  const [result, count] = await Promise.all([
    prisma.user.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      select: {
        ...userSelectedFields,
      },
    }),
    prisma.user.groupBy({
      by: ["role"],
      where: whereConditions,
      _count: true,
    }),
  ]);

  const total = count.reduce((sum, curr) => sum + curr._count, 0);
  const by_role = count.reduce((acc, curr) => {
    acc[curr.role] = curr._count;
    return acc;
  }, {} as Record<string, number>);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      by_role,
    },
    data: result,
  };
};

// -------------------------------------- GET USER (SINGLE) ---------------------------------
const getUser = async (id: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id,
      status: UserStatus.ACTIVE,
      is_deleted: false,
    },
    select: {
      ...userSelectedFields,
    },
  });
  return result;
};

// -------------------------------------- GET PROFILE ---------------------------------------
const getProfile = async (user: TAuthUser) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id: user.id,
    },
    select: {
      ...userSelectedFields,
    },
  });
  return result;
};

// -------------------------------------- UPDATE PROFILE ------------------------------------
const updateProfile = async (
  user: TAuthUser,
  payload: Record<string, any>,
  file: TFile | undefined
) => {
  let profilePic;

  if (file) {
    const metadata = await sharp(file.buffer).metadata();
    const fileName = `${Date.now()}_${file.originalname}`;
    const { data } = await supabase.storage
      .from(config.user_bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (!data?.id) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to upload profile picture"
      );
    }

    const image = {
      user_id: user.id,
      name: file.originalname,
      alt_text: file.originalname,
      type: file.mimetype,
      size: file.size,
      width: metadata.width || 0,
      height: metadata.height || 0,
      path: data.path,
      bucket_id: data.id,
      bucket_name: config.user_bucket,
    };

    profilePic = await prisma.image.create({
      data: image,
    });

    const userInfo = await prisma.user.findUniqueOrThrow({
      where: {
        id: user?.id,
      },
    });

    if (userInfo.profile_pic) {
      const profilePic = await prisma.image.findFirst({
        where: {
          path: userInfo.profile_pic,
        },
      });
      if (profilePic) {
        await supabase.storage
          .from(config.user_bucket)
          .remove([profilePic.path]);
        await prisma.image.delete({
          where: {
            id: profilePic.id,
          },
        });
      }
    }
  }

  if (profilePic?.path) {
    payload.profile_pic = profilePic.path;
  }

  const result = prisma.user.update({
    where: {
      id: user?.id,
    },
    data: payload,
    select: {
      ...userSelectedFields,
    },
  });

  return result;
};

// -------------------------------------- UPDATE USER BY ADMIN ------------------------------
const updateUserByAdmin = async (
  user: TAuthUser,
  id: string,
  payload: UpdateUserByAdminPayload
) => {
  await authorizeUserUpdate(user as TAuthUser, id);

  const [result] = await prisma.$transaction([
    prisma.user.update({
      where: {
        id,
        is_deleted: false,
      },
      data: payload,
      select: {
        ...userSelectedFields,
      },
    }),
  ]);

  if (!result) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  return result;
};

// -------------------------------------- AUTHORIZATION CHECKER -----------------------------
const authorizeUserUpdate = async (user: TAuthUser, id: string) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: { role: true },
  });

  if (userData.role === UserRole.SUPER_ADMIN && user.role === UserRole.ADMIN) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Admins cannot modify Super Admin"
    );
  }
};

export const UserServices = {
  getUsers,
  getUser,
  getProfile,
  updateProfile,
  updateUserByAdmin,
  addUserByAdmin,
};
