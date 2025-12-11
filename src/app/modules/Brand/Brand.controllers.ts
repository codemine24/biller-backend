import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { BrandServices } from "./Brand.services";
import { pick } from "../../utils/pick";
import { brandFilterableFields } from "./Brand.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE BRAND -----------------------------------
const createBrand = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await BrandServices.createBrand(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Brand created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET BRANDS -------------------------------------
const getBrands = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, brandFilterableFields);
    const result = await BrandServices.getBrands(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Brands retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET BRAND (SINGLE) -----------------------------
const getBrand = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await BrandServices.getBrand(
      req.params.id,
      req.user?.company_id || null
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Brand retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE BRAND -----------------------------------
const updateBrand = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await BrandServices.updateBrand(
      req.params.id,
      req.user?.company_id || null,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Brand updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE BRAND -----------------------------------
const deleteBrand = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await BrandServices.deleteBrand(
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

export const BrandControllers = {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
};
