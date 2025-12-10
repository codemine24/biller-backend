import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import handleZodError from "../error/handle-zod-error";
import { TErrorSources } from "../interfaces/error";
import handlePrismaClientKnownError from "../error/handle-prisma-client-known-error";
import handlePrismaValidationError from "../error/handle-prisma-validation-error";
import config from "../config";
import { Prisma } from "../../../prisma/generated/client";

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(error);
  let statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = error.message || "Something went wrong!";
  let errorSources: TErrorSources[] = [
    {
      path: "",
      message: error.message || "",
    },
  ];

  if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    const simplifiedError = handlePrismaValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error.message === "jwt expired") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Token has been expired";
  }
  res.status(statusCode).json({
    success: false,
    message: message,
    errorSources,
    stack: config.node_env === "development" ? error.stack : null,
  });
};

export default globalErrorHandler;
