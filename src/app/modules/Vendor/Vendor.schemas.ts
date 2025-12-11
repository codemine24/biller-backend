import { z } from "zod";
import {
  contactNumberExample,
  contactNumberRegex,
} from "../../constants/common";

const createVendor = z.object({
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
      address: z.string().optional(),
    })
    .strict(),
});

const updateVendor = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name cannot be empty").optional(),
      email: z.email({ message: "Email is invalid" }).optional(),
      contact_number: z.string().regex(contactNumberRegex, {
        message: `Contact number should be a valid Bangladeshi number like ${contactNumberExample}`,
      }).optional(),
      address: z.string().optional(),
      is_active: z.boolean().optional(),
      total_due: z.number().nonnegative({ message: "Total due must be a non-negative number" }).optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.name ||
        data.email ||
        data.contact_number ||
        data.address ||
        data.is_active !== undefined ||
        data.total_due !== undefined,
      {
        message: "At least one field must be provided for update",
      }
    ),
});

export const VendorSchemas = {
  createVendor,
  updateVendor,
};
