import { Prisma } from "../../../prisma/generated/client";
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error";
import httpStatus from "http-status";

const handlePrismaClientKnownError = (
  err: Prisma.PrismaClientKnownRequestError
): TGenericErrorResponse => {
  let statusCode = 400;
  let message = "Database error!";
  let errorSources: TErrorSources[] = [];

  if (err.code === "P2002") {
    statusCode = httpStatus.CONFLICT;
    message = "Duplicate value exists.";
    const target = err.meta?.target;
    if (target) {
      errorSources = (target as string[]).map((field: string) => ({
        path: field,
        message: `The ${field} is already exists in the ${err.meta?.modelName}. Please try another ${field}`,
      }));
      if (errorSources.length)
        message = errorSources.map((item) => item.message).join(" | ");
    }
  } else if (err.code === "P2025") {
    statusCode = httpStatus.NOT_FOUND;
    message = (err.meta?.cause as string) || "Data not found";
    errorSources = [
      {
        path: err.meta?.modelName as string,
        message: (err.meta?.cause as string) || err.message,
      },
    ];
  } else if (err.code === "P2003") {
    console.log(err);
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaClientKnownError;
