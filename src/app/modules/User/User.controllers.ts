import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { UserServices } from "./User.services";
import { pick } from "../../utils/pick";
import { userFilterableFields } from "./User.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";
import { toSentenceCase } from "../../utils/helper";

// -------------------------------------- CREATE USER -----------------------------------
const createUser = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await UserServices.createUser(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: `${toSentenceCase(result.role)} created successfully`,
      data: result,
    });
  }
);

// -------------------------------------- GET USERS -------------------------------------
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

// -------------------------------------- GET USER (SINGLE) -----------------------------
const getUser = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await UserServices.getUser(
      req.params.id,
      req.user as TAuthUser
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE USER -----------------------------------
const updateUser = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await UserServices.updateUser(
      req.params.id,
      req.user as TAuthUser,
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

// -------------------------------------- DELETE USER -----------------------------------
const deleteUser = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await UserServices.deleteUser(
      req.params.id,
      req.user as TAuthUser
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: null,
    });
  }
);

export const UserControllers = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
