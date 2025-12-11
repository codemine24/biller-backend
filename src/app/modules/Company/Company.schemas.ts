import { z } from "zod";
import { contactNumberExample, contactNumberRegex } from "../../constants/common";
import { CompanyStatus } from "../../../../prisma/generated";

const createCompany = z.object({
  body: z
    .object({
      name: z
        .string({
          message: "Name is required",
        })
        .min(1, "Name cannot be empty"),
      email: z.email({ message: "Email is invalid" }).optional(),
      contact_number: z.string({ message: "Contact number is required" }).regex(contactNumberRegex, {
              message: `Contact number should be a valid Bangladeshi number like ${contactNumberExample}`,
            }),
      address: z
        .string({
          message: "Address is required",
        })
        .min(1, "Address cannot be empty"),
    })
    .strict(),
});

const updateCompanyBySuperAdmin = z.object({
  body: z
    .object({
      status: z.enum(Object.values(CompanyStatus), {
        message: `Status should be one of ${Object.values(CompanyStatus).join(
                " | "
              )}`,
      }).optional(),
      address: z.string().min(1, "Address cannot be empty").optional(),
      contact_number: z.string().regex(contactNumberRegex, {
        message: `Contact number should be a valid Bangladeshi number like ${contactNumberExample}`,
      }).optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.status !== undefined ||
        data.address ||
        data.contact_number,
      {
        message: "At least one field must be provided for update",
      }
    ),
});

const updateCompanyBySelf = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name cannot be empty").optional(),
      email: z.email({ message: "Email is invalid" }).optional(),
      address: z.string().min(1, "Address cannot be empty").optional(),
      contact_number: z.string().regex(contactNumberRegex, {
        message: `Contact number should be a valid Bangladeshi number like ${contactNumberExample}`,
      }).optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.name ||
        data.email !== undefined ||
        data.address ||
        data.contact_number,
      {
        message: "At least one field must be provided for update",
      }
    ),
});

export const CompanySchemas = {
  createCompany,
  updateCompanyBySuperAdmin,
  updateCompanyBySelf,
};
