import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { UserServices } from "./User.services";
import { pick } from "../../utils/pick";
import { userFilterableFields } from "./User.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- ADD USER BY ADMIN ---------------------------------
const addUserByAdmin = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await UserServices.addUserByAdmin(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET USERS -----------------------------------------
const getUsers = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, userFilterableFields);
    const result = await UserServices.getUsers(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET USER (SINGLE) ---------------------------------
const getUser = catchAsync(async (req, res, next) => {
  const result = await UserServices.getUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

// -------------------------------------- GET PROFILE ---------------------------------------
const getProfile = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await UserServices.getProfile(req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE PROFILE ------------------------------------
const updateProfile = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await UserServices.updateProfile(
      req.user as TAuthUser,
      req.body,
      req.file
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE USER BY ADMIN ------------------------------
const updateUserByAdmin = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await UserServices.updateUserByAdmin(
      req.user as TAuthUser,
      req.params.id,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User updated successfully",
      data: result,
    });
  }
);

export const UserControllers = {
  getUsers,
  getUser,
  getProfile,
  updateProfile,
  updateUserByAdmin,
  addUserByAdmin,
};
