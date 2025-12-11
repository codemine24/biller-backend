import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { CompanyServices } from "./Company.services";
import { pick } from "../../utils/pick";
import { companyFilterableFields } from "./Company.constants";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE COMPANY -------------------------------------
const createCompany = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CompanyServices.createCompany(req.body, req.user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Company created successfully",
      data: result,
    });
  }
);

// -------------------------------------- GET COMPANIES ---------------------------------------
const getCompanies = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const filteredQuery = pick(req.query, companyFilterableFields);
    const result = await CompanyServices.getCompanies(filteredQuery);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Companies retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -------------------------------------- GET COMPANY (SINGLE) --------------------------------
const getCompany = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CompanyServices.getCompany(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Company retrieved successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE COMPANY BY SUPER ADMIN ----------------------
const updateCompanyBySuperAdmin = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CompanyServices.updateCompanyBySuperAdmin(
      req.params.id,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Company updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- UPDATE COMPANY BY SELF -----------------------------
const updateCompanyBySelf = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CompanyServices.updateCompanyBySelf(
      req.params.id,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Company profile updated successfully",
      data: result,
    });
  }
);

// -------------------------------------- DELETE COMPANY --------------------------------------
const deleteCompany = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const result = await CompanyServices.deleteCompany(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: null,
    });
  }
);

export const CompanyControllers = {
  createCompany,
  getCompanies,
  getCompany,
  updateCompanyBySuperAdmin,
  updateCompanyBySelf,
  deleteCompany,
};
