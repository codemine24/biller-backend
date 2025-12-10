import { Prisma } from "../../../prisma/generated/client";
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error";

const handlePrismaValidationError = (
  error: Prisma.PrismaClientValidationError
): TGenericErrorResponse => {
  const statusCode = 400;
  const message = "Database validation error!";

  const errorSources: TErrorSources[] = [
    {
      path: "Database",
      message: "Perhaps you are missing some required fields",
    },
  ];

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaValidationError;
