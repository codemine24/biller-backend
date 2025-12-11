import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { VendorServices } from "./Vendor.services";
import { pick } from "../../utils/pick";
import { vendorFilterableFields } from "./Vendor.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE VENDOR -----------------------------------
const createVendor = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await VendorServices.createVendor(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Vendor created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET VENDORS -------------------------------------
const getVendors = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, vendorFilterableFields);
    const result = await VendorServices.getVendors(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Vendors retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET VENDOR (SINGLE) -----------------------------
const getVendor = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await VendorServices.getVendor(
      req.params.id,
      req.user?.company_id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Vendor retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE VENDOR -----------------------------------
const updateVendor = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await VendorServices.updateVendor(
      req.params.id,
      req.user?.company_id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Vendor updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE VENDOR -----------------------------------
const deleteVendor = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await VendorServices.deleteVendor(
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

export const VendorControllers = {
  createVendor,
  getVendors,
  getVendor,
  updateVendor,
  deleteVendor,
};
