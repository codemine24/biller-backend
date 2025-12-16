import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { InventoryServices } from "./Inventory.services";
import { pick } from "../../utils/pick";
import { inventoryFilterableFields } from "./Inventory.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- GET INVENTORY -------------------------------------
const getInventory = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, inventoryFilterableFields);
    const result = await InventoryServices.getInventory(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Inventory retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET INVENTORY BY ID -------------------------------
const getInventoryById = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await InventoryServices.getInventoryById(
      req.params.id,
      req.user?.company_id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Inventory record retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET INVENTORY BY STORE ----------------------------
const getInventoryByStore = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, ["page", "limit", "sort_by", "sort_order"]);
    const result = await InventoryServices.getInventoryByStore(
      req.params.storeId,
      req.user?.company_id as string,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Store inventory retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET INVENTORY BY PRODUCT --------------------------
const getInventoryByProduct = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await InventoryServices.getInventoryByProduct(
      req.params.productId,
      req.user?.company_id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product inventory retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET LOW STOCK ITEMS -------------------------------
const getLowStockItems = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, ["page", "limit", "store_id"]);
    const result = await InventoryServices.getLowStockItems(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Low stock items retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- CREATE INVENTORY ----------------------------------
const createInventory = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await InventoryServices.createInventory(
      req.body,
      req.user as TAuthUser
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Inventory record created successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE INVENTORY ----------------------------------
const updateInventory = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await InventoryServices.updateInventory(
      req.params.id,
      req.user?.company_id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Inventory updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- ADJUST INVENTORY ----------------------------------
const adjustInventory = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await InventoryServices.adjustInventory(
      req.params.id,
      req.user?.company_id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Inventory adjusted successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE INVENTORY ----------------------------------
const deleteInventory = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await InventoryServices.deleteInventory(
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

// -------------------------------------- GET STORE WISE PRODUCTS -------------------------------
const getStoreWiseProducts = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, [
      "page",
      "limit",
      "sort_by",
      "sort_order",
      "store_id",
      "search_term",
    ]);
    const result = await InventoryServices.getStoreWiseProducts(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Store-wise products retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET BRAND WISE PRODUCTS -------------------------------
const getBrandWiseProducts = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, [
      "page",
      "limit",
      "sort_by",
      "sort_order",
      "brand_id",
      "search_term",
      "store_id",
    ]);
    const result = await InventoryServices.getBrandWiseProducts(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Brand-wise products retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET CATEGORY WISE PRODUCTS ----------------------------
const getCategoryWiseProducts = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, [
      "page",
      "limit",
      "sort_by",
      "sort_order",
      "category_id",
      "search_term",
      "store_id",
    ]);
    const result = await InventoryServices.getCategoryWiseProducts(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category-wise products retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

export const InventoryControllers = {
  getInventory,
  getInventoryById,
  getInventoryByStore,
  getInventoryByProduct,
  getLowStockItems,
  getStoreWiseProducts,
  getBrandWiseProducts,
  getCategoryWiseProducts,
  createInventory,
  updateInventory,
  adjustInventory,
  deleteInventory,
};
