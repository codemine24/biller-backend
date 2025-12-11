import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { CustomerServices } from "./Customer.services";
import { pick } from "../../utils/pick";
import { customerFilterableFields } from "./Customer.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE CUSTOMER -----------------------------------
const createCustomer = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CustomerServices.createCustomer(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Customer created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET CUSTOMERS -------------------------------------
const getCustomers = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, customerFilterableFields);
    const result = await CustomerServices.getCustomers(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customers retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET CUSTOMER (SINGLE) -----------------------------
const getCustomer = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CustomerServices.getCustomer(
      req.params.id,
      req.user?.company_id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customer retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE CUSTOMER -----------------------------------
const updateCustomer = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CustomerServices.updateCustomer(
      req.params.id,
      req.user?.company_id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customer updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE CUSTOMER -----------------------------------
const deleteCustomer = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CustomerServices.deleteCustomer(
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

export const CustomerControllers = {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
};
