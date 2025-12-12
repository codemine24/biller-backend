import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { StoreServices } from "./Store.services";
import { pick } from "../../utils/pick";
import { storeFilterableFields } from "./Store.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE STORE -----------------------------------
const createStore = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await StoreServices.createStore(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Store created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET STORES -------------------------------------
const getStores = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, storeFilterableFields);
    const result = await StoreServices.getStores(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Stores retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET STORE (SINGLE) -----------------------------
const getStore = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await StoreServices.getStore(
      req.params.id,
      req.user?.company_id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Store retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE STORE -----------------------------------
const updateStore = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await StoreServices.updateStore(
      req.params.id,
      req.user?.company_id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Store updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE STORE -----------------------------------
const deleteStore = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await StoreServices.deleteStore(
      req.params.id,
      req.user?.company_id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: null,
    });
  }
);

export const StoreControllers = {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore,
};
