import { z } from "zod";
import {
  contactNumberExample,
  contactNumberRegex,
} from "../../constants/common";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";

const addUserByAdmin = z.object({
  body: z
    .object({
      name: z
        .string({
          error: "Name should be a text",
        })
        .min(1, "Name is required"),
      email: z.email({ message: "Email is invalid" }).optional(),
      contact_number: z.regex(contactNumberRegex, {
        message: `Contact number should be a valid Bangladeshi number like as ${contactNumberExample}`,
      }),
      role: z
        .enum(Object.values(UserRole), {
          error: `Role should be one of ${Object.values(UserRole).join(" | ")}`,
        })
        .optional(),
    })
    .strict(),
});

const updateProfile = z.object({
  body: z
    .object({
      name: z
        .string({
          error: "Name should be a text",
        })
        .optional(),
      email: z.email({ message: "Email is invalid" }).optional(),
    })
    .strict(),
});

const updateUserByAdmin = z.object({
  body: z
    .object({
      role: z
        .enum(Object.values(UserRole), {
          error: `Role should be one of ${Object.values(UserRole).join(" | ")}`,
        })
        .optional(),
      status: z
        .enum(Object.values(UserRole), {
          error: `Status should be one of ${Object.values(UserStatus).join(
            " | "
          )}`,
        })
        .optional(),
      is_deleted: z.boolean().optional(),
      email: z.email({ message: "Email is invalid" }).optional(),
    })
    .strict()
    .refine((data) => data.role || data.status || data.is_deleted, {
      path: ["role", "status", "is_deleted", "email"],
      message: "Either role, status, email or is_deleted must be provided",
    }),
});

export const UserSchemas = {
  addUserByAdmin,
  updateProfile,
  updateUserByAdmin,
};
