import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { SaleServices } from "./Sale.services";
import { pick } from "../../utils/pick";
import { saleFilterableFields } from "./Sale.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE SALE -----------------------------------
const createSale = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await SaleServices.createSale(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Invoice created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET SALES -------------------------------------
const getSales = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, saleFilterableFields);
    const result = await SaleServices.getSales(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Invoices retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET SALE (SINGLE) -----------------------------
const getSale = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await SaleServices.getSale(
      req.params.id,
      req.user?.company_id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Invoice retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE SALE -----------------------------------
const updateSale = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await SaleServices.updateSale(
      req.params.id,
      req.user?.company_id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Invoice updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE SALE -----------------------------------
const deleteSale = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await SaleServices.deleteSale(
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

export const SaleControllers = {
  createSale,
  getSales,
  getSale,
  updateSale,
  deleteSale,
};
