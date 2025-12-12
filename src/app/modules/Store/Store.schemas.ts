import { z } from "zod";
import {
  contactNumberExample,
  contactNumberRegex,
} from "../../constants/common";

const createStore = z.object({
  body: z
    .object({
      name: z
        .string({
          message: "Name is required",
        })
        .min(1, "Name cannot be empty"),
      address: z
        .string({
          message: "Address is required",
        })
        .min(1, "Address cannot be empty"),
      contact_number: z
        .string()
        .regex(contactNumberRegex, {
          message: `Contact number should be a valid Bangladeshi number like ${contactNumberExample}`,
        })
        .optional(),
    })
    .strict(),
});

const updateStore = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name cannot be empty").optional(),
      address: z.string().min(1, "Address cannot be empty").optional(),
      contact_number: z
        .string()
        .regex(contactNumberRegex, {
          message: `Contact number should be a valid Bangladeshi number like ${contactNumberExample}`,
        })
        .optional(),
      is_active: z.boolean().optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.name ||
        data.address ||
        data.contact_number ||
        data.is_active !== undefined,
      {
        message: "At least one field must be provided for update",
      }
    ),
});

export const StoreSchemas = {
  createStore,
  updateStore,
};
