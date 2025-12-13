import { z } from "zod";
import { contactNumberExample, contactNumberRegex } from "../../constants/common";
import { UserRole, UserStatus } from "../../../../prisma/generated";
import { enumMessageGenerator } from "../../utils/helper";

const createUser = z.object({
  body: z
    .object({
      name: z.string({ message: "Name is required" }).min(1, "Name is required"),
      email: z.email({ message: "Invalid email address" }).optional(),
      contact_number: z
            .string({ error: "Contact number should be a text" })
            .regex(contactNumberRegex, {
              message: `Contact number should be a valid Bangladeshi number like as ${contactNumberExample}`,
            }),
      password: z
      .string({ error: "Password should be a text" })
      .min(6, { message: "Password must be at least 6 characters long" })
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, {
        message: "Password must contain at least one letter and one number",
      }),
      avatar: z.url({ message: "Avatar must be a valid URL" }).optional(),
      role: z.enum(Object.values(UserRole), {
        message: enumMessageGenerator("Role", Object.values(UserRole)),
      }).default(UserRole.SALESMAN),
      company_id: z.uuid({ message: "Company ID must be a valid UUID" }).optional(),
    })
    .strict(),
});

const updateUser = z.object({
  body: z
    .object({
      name: z.string({ message: "Name is required" }).min(1, "Name is required").optional(),
      email: z.string().email({ message: "Invalid email address" }).optional(),
      contact_number: z.string({ message: "Contact number is required" }).regex(contactNumberRegex, "Invalid Bangladeshi phone number").optional(),
      avatar: z.url({ message: "Avatar must be a valid URL" }).optional(),
      role: z.enum(Object.values(UserRole), {
        message: enumMessageGenerator("Role", Object.values(UserRole)),
      }).optional(),
      status: z.enum(Object.values(UserStatus), {
        message: enumMessageGenerator("Status", Object.values(UserStatus)),
      }).optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.name ||
        data.email !== undefined ||
        data.contact_number ||
        data.avatar !== undefined ||
        data.role ||
        data.status,
      {
        message: "At least one field must be provided for update",
      }
    ),
});

export const UserSchemas = {
  createUser,
  updateUser,
};