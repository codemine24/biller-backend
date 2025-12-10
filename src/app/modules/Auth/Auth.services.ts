import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { TAuthUser } from "../../interfaces/common";
import { newPasswordTemplate } from "../../template/new-password-template";
import sendEmail from "../../utils/email-sender";
import { userSelectedFields } from "../User/User.constants";
import { ResetPasswordPayload, TLogin, TRegister } from "./Auth.interfaces";
import { prisma } from "../../shared/prisma";
import { tokenGenerator, tokenVerifier } from "../../utils/jwt-helpers";
import { passwordGenerator } from "../../utils/password-generator";
import CustomizedError from "../../error/customized-error";
import { UserStatus } from "../../../../prisma/generated/enums";
import config from "../../config";

// -------------------------------------- REGISTER ------------------------------------------
const register = async (data: TRegister) => {
  const hashedPassword = await bcrypt.hash(
    data.password,
    Number(config.salt_rounds)
  );

  const result = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: userSelectedFields,
  });

  return result;
};

// -------------------------------------- LOGIN ---------------------------------------------
const login = async (credential: TLogin) => {
  const { email_or_contact_number, password } = credential;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: email_or_contact_number,
        },
        {
          contact_number: email_or_contact_number,
        },
      ],
      status: UserStatus.ACTIVE,
      is_deleted: false,
    },
  });

  if (!user) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "User not found");
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    throw new CustomizedError(
      httpStatus.FORBIDDEN,
      "Email/Contact number or password is invalid"
    );
  }

  const jwtPayload = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar: user.avatar,
    contact_number: user.contact_number,
    email: user.email,
    role: user.role,
  };

  const accessToken = tokenGenerator(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiresin
  );

  const refreshToken = tokenGenerator(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expiresin
  );

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    contact_number: user.contact_number,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
    access_token: accessToken,
    refreshToken,
  };
};

// -------------------------------------- GET ACCESS TOKEN ----------------------------------
const getAccessToken = async (token: string) => {
  if (!token) {
    throw new CustomizedError(httpStatus.BAD_REQUEST, "Token not found");
  }

  const verifiedUser = tokenVerifier(
    token,
    config.jwt_refresh_secret
  ) as TAuthUser;

  const user = await prisma.user.findFirst({
    where: {
      id: verifiedUser.id,
      status: UserStatus.ACTIVE,
      is_deleted: false,
    },
  });

  if (!user) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check if password was changed after token was issued
  if (user.password_changed_at) {
    const passwordChangedTime = Math.floor(
      new Date(user.password_changed_at).getTime() / 1000
    );

    if (passwordChangedTime > verifiedUser.iat) {
      throw new CustomizedError(
        httpStatus.UNAUTHORIZED,
        "You are not authorized"
      );
    }
  }

  const jwtPayload = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar: user.avatar,
    contact_number: user.contact_number,
    email: user.email,
    role: user.role,
  };

  const accessToken = tokenGenerator(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiresin
  );

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    contact_number: user.contact_number,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
    access_token: accessToken,
  };
};

// -------------------------------------- RESET PASSWORD ------------------------------------
const resetPassword = async (
  user: TAuthUser | undefined,
  payload: ResetPasswordPayload
) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: user?.id,
      status: UserStatus.ACTIVE,
      is_deleted: false,
    },
  });

  const checkPassword = await bcrypt.compare(
    payload.old_password,
    userInfo.password
  );

  if (!checkPassword) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "Old password is invalid"
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.new_password,
    Number(config.salt_rounds)
  );

  const result = await prisma.user.update({
    where: {
      id: userInfo?.id,
    },
    data: {
      password: hashedPassword,
      password_changed_at: new Date(),
    },
    select: {
      ...userSelectedFields,
    },
  });

  if (!result) {
    throw new CustomizedError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update password"
    );
  }

  const jwtPayload = {
    id: result.id,
    first_name: result.first_name,
    last_name: result.last_name,
    avatar: result.avatar,
    contact_number: result.contact_number,
    email: result.email,
    role: result.role,
  };

  const accessToken = tokenGenerator(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiresin
  );

  const refreshToken = tokenGenerator(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expiresin
  );

  return {
    ...result,
    access_token: accessToken,
    refreshToken,
  };
};

// -------------------------------------- FORGOT PASSWORD -----------------------------------
const forgotPassword = async (email_or_contact_number: string) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: email_or_contact_number,
        },
        {
          contact_number: email_or_contact_number,
        },
      ],
      status: UserStatus.ACTIVE,
      is_deleted: false,
    },
  });

  if (!user) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "User not found");
  }

  const generatedPassword = passwordGenerator(6);
  const hashedPassword = await bcrypt.hash(
    generatedPassword,
    Number(config.salt_rounds)
  );

  const emailBody = newPasswordTemplate(generatedPassword);

  let emailResponse;
  if (user.email) {
    emailResponse = await sendEmail(user.email, emailBody, "New password");
  }

  const SMSBody = `Dear ${
    user.first_name || "customer"
  }, your new password is: ${generatedPassword} \nTECHTONG`;

  if (emailResponse?.accepted?.length === 0)
    throw new CustomizedError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to send new password to user email and contact number"
    );

  await prisma.user.update({
    where: {
      contact_number: user.contact_number,
    },
    data: {
      password: hashedPassword,
      password_changed_at: new Date(),
    },
  });

  return null;
};

export const AuthServices = {
  register,
  login,
  resetPassword,
  forgotPassword,
  getAccessToken,
};
