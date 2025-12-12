import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { PurchaseServices } from "./Purchase.services";
import { pick } from "../../utils/pick";
import { purchaseFilterableFields } from "./Purchase.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE PURCHASE -----------------------------------
const createPurchase = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await PurchaseServices.createPurchase(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Purchase created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET PURCHASES -------------------------------------
const getPurchases = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, purchaseFilterableFields);
    const result = await PurchaseServices.getPurchases(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Purchases retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET PURCHASE (SINGLE) -----------------------------
const getPurchase = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await PurchaseServices.getPurchase(
      req.params.id,
      req.user?.company_id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Purchase retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE PURCHASE -----------------------------------
const updatePurchase = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await PurchaseServices.updatePurchase(
      req.params.id,
      req.user?.company_id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Purchase updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE PURCHASE -----------------------------------
const deletePurchase = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await PurchaseServices.deletePurchase(
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

export const PurchaseControllers = {
  createPurchase,
  getPurchases,
  getPurchase,
  updatePurchase,
  deletePurchase,
};
