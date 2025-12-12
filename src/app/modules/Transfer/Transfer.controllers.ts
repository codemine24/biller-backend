import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { TransferServices } from "./Transfer.services";
import { pick } from "../../utils/pick";
import { transferFilterableFields } from "./Transfer.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE TRANSFER -----------------------------------
const createTransfer = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await TransferServices.createTransfer(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Transfer created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET TRANSFERS -------------------------------------
const getTransfers = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, transferFilterableFields);
    const result = await TransferServices.getTransfers(
      req.user as TAuthUser,
      filteredQuery
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transfers retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET TRANSFER (SINGLE) -----------------------------
const getTransfer = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await TransferServices.getTransfer(
      req.params.id,
      req.user?.company_id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transfer retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE TRANSFER -----------------------------------
const updateTransfer = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await TransferServices.updateTransfer(
      req.params.id,
      req.user?.company_id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transfer updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE TRANSFER -----------------------------------
const deleteTransfer = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await TransferServices.deleteTransfer(
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

export const TransferControllers = {
  createTransfer,
  getTransfers,
  getTransfer,
  updateTransfer,
  deleteTransfer,
};
