import z from "zod";
import {
  contactNumberExample,
  contactNumberRegex,
} from "../../constants/common";

// -------------------------------------- REGISTER ------------------------------------------
const register = z.object({
  body: z.object({
    name: z
      .string({
        error: "Name should be a text",
      })
      .min(1, "Name is required"),
    email: z.email({ message: "Email is invalid" }).optional(),
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
  }).strict(),
});

// -------------------------------------- LOGIN ---------------------------------------------
const login = z.object({
  body: z.object({
    email_or_contact_number: z
      .string({ error: "Email or contact number should be a text" })
      .min(1, { message: "Email or contact number is required" }),
    password: z
      .string({ error: "Password should be a text" })
      .min(1, "Password is required"),
  }),
});

// -------------------------------------- RESET PASSWORD ------------------------------------
const resetPassword = z.object({
  body: z.object({
    old_password: z
      .string({ error: "Old password should be a text" })
      .min(1, "Password is required"),
    new_password: z
      .string({ error: "New password should be a text" })
      .min(6, { message: "New password must be at least 6 characters long" })
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, {
        message: "New password must contain at least one letter and one number",
      }),
  }),
});

// -------------------------------------- FORGOT PASSWORD -----------------------------------
const forgotPassword = z.object({
  body: z.object({
    email_or_contact_number: z
      .string({
        error: "Email or contact number should be a text",
      })
      .min(1, "Email or contact number is required")
      .refine(
        (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const bangladeshiPhoneRegex = /^01\d{9}$/;
          return emailRegex.test(value) || bangladeshiPhoneRegex.test(value);
        },
        {
          message: "Invalid email or contact number",
        }
      ),
  }),
});

export const AuthSchemas = {
  register,
  login,
  resetPassword,
  forgotPassword,
};
