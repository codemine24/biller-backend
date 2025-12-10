import { Request } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { AuthServices } from "./Auth.services";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- REGISTER ------------------------------------------
const register = catchAsync(async (req, res, next) => {
  const result = await AuthServices.register(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

// -------------------------------------- LOGIN ---------------------------------------------
const login = catchAsync(async (req, res, next) => {
  const { refreshToken, ...result } = await AuthServices.login(req.body);
  const maxAge = 60 * 24 * 60 * 60 * 1000;
  res.cookie("refresh_token", refreshToken, { maxAge, httpOnly: true });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

// -------------------------------------- GET ACCESS TOKEN ----------------------------------
const getAccessToken = catchAsync(async (req, res, next) => {
  const result = await AuthServices.getAccessToken(req.cookies?.refresh_token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token generated successfully",
    data: result,
  });
});

// -------------------------------------- RESET PASSWORD ------------------------------------
const resetPassword = catchAsync(
  async (req: Request & { user?: TAuthUser }, res, next) => {
    const { refreshToken, ...result } = await AuthServices.resetPassword(
      req?.user,
      req.body
    );
    const maxAge = 60 * 24 * 60 * 60 * 1000;
    res.cookie("refresh_token", refreshToken, { maxAge, httpOnly: true });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset successfully",
      data: result,
    });
  }
);

// -------------------------------------- FORGOT PASSWORD -----------------------------------
const forgotPassword = catchAsync(async (req, res, next) => {
  const result = await AuthServices.forgotPassword(
    req.body.email_or_contact_number
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New password sent to your email and contact number",
    data: result,
  });
});

export const AuthControllers = {
  register,
  login,
  resetPassword,
  forgotPassword,
  getAccessToken,
};
