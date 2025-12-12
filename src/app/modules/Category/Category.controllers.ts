import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { CategoryServices } from "./Category.services";
import { pick } from "../../utils/pick";
import { categoryFilterableFields } from "./Category.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE CATEGORY -----------------------------------
const createCategory = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CategoryServices.createCategory(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Category created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET CATEGORIES -------------------------------------
const getCategories = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, categoryFilterableFields);
    const result = await CategoryServices.getCategories(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Categories retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET CATEGORY (SINGLE) -----------------------------
const getCategory = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CategoryServices.getCategory(
      req.params.id,
      req.user?.company_id || null
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE CATEGORY -----------------------------------
const updateCategory = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CategoryServices.updateCategory(
      req.params.id,
      req.user?.company_id || null,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE CATEGORY -----------------------------------
const deleteCategory = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CategoryServices.deleteCategory(
      req.params.id,
      req.user?.company_id || null
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: null,
    });
  }
);

export const CategoryControllers = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
