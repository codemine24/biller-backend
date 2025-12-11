import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { ProductServices } from "./Product.services";
import { pick } from "../../utils/pick";
import { productFilterableFields } from "./Product.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE PRODUCT -----------------------------------
const createProduct = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await ProductServices.createProduct(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Product created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET PRODUCTS -------------------------------------
const getProducts = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, productFilterableFields);
    const result = await ProductServices.getProducts(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Products retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET PRODUCT (SINGLE) -----------------------------
const getProduct = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await ProductServices.getProduct(
      req.params.id,
      req.user?.company_id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE PRODUCT -----------------------------------
const updateProduct = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await ProductServices.updateProduct(
      req.params.id,
      req.user?.company_id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE PRODUCT -----------------------------------
const deleteProduct = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await ProductServices.deleteProduct(
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

export const ProductControllers = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
