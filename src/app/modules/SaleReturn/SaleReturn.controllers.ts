import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { SaleReturnServices } from "./SaleReturn.services";
import { pick } from "../../utils/pick";
import { saleReturnFilterableFields } from "./SaleReturn.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE SALE RETURN -----------------------------------
const createSaleReturn = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await SaleReturnServices.createSaleReturn(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Sale return created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET SALE RETURNS -------------------------------------
const getSaleReturns = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, saleReturnFilterableFields);
    const result = await SaleReturnServices.getSaleReturns(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Sale returns retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET SALE RETURN (SINGLE) -----------------------------
const getSaleReturn = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await SaleReturnServices.getSaleReturn(
      req.params.id,
      req.user?.company_id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Sale return retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE SALE RETURN -----------------------------------
const updateSaleReturn = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await SaleReturnServices.updateSaleReturn(
      req.params.id,
      req.user?.company_id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Sale return updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE SALE RETURN -----------------------------------
const deleteSaleReturn = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await SaleReturnServices.deleteSaleReturn(
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

export const SaleReturnControllers = {
  createSaleReturn,
  getSaleReturns,
  getSaleReturn,
  updateSaleReturn,
  deleteSaleReturn,
};
