import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const formDataValidator = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data) {
        const validatedData = await schema.parseAsync({
          body: JSON.parse(req.body.data),
        });
        req.body = validatedData?.body;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default formDataValidator;
