import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { PurchaseReturnServices } from "./PurchaseReturn.services";
import { pick } from "../../utils/pick";
import { purchaseReturnFilterableFields } from "./PurchaseReturn.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE PURCHASE RETURN -----------------------------------
const createPurchaseReturn = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await PurchaseReturnServices.createPurchaseReturn(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Purchase return created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET PURCHASE RETURNS -------------------------------------
const getPurchaseReturns = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, purchaseReturnFilterableFields);
    const result = await PurchaseReturnServices.getPurchaseReturns(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Purchase returns retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET PURCHASE RETURN (SINGLE) -----------------------------
const getPurchaseReturn = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await PurchaseReturnServices.getPurchaseReturn(
      req.params.id,
      req.user?.company_id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Purchase return retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE PURCHASE RETURN -----------------------------------
const updatePurchaseReturn = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await PurchaseReturnServices.updatePurchaseReturn(
      req.params.id,
      req.user?.company_id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Purchase return updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE PURCHASE RETURN -----------------------------------
const deletePurchaseReturn = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await PurchaseReturnServices.deletePurchaseReturn(
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

export const PurchaseReturnControllers = {
  createPurchaseReturn,
  getPurchaseReturns,
  getPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
};
