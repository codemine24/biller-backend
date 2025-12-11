import { z } from "zod";

const createBrand = z.object({
  body: z
    .object({
      name: z
        .string({
          message: "Name is required",
        })
        .min(1, "Name cannot be empty"),
      slug: z
        .string()
        .min(1, "Slug cannot be empty")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
          message: "Slug must be lowercase with hyphens only (e.g., brand-name)",
        })
        .optional(),
      logo: z.string().url({ message: "Logo must be a valid URL" }).optional(),
      description: z.string().optional(),
    })
    .strict(),
});

const updateBrand = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name cannot be empty").optional(),
      slug: z
        .string()
        .min(1, "Slug cannot be empty")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
          message: "Slug must be lowercase with hyphens only (e.g., brand-name)",
        })
        .optional(),
      logo: z.string().url({ message: "Logo must be a valid URL" }).optional(),
      description: z.string().optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.name ||
        data.slug ||
        data.logo !== undefined ||
        data.description !== undefined,
      {
        message: "At least one field must be provided for update",
      }
    ),
});

export const BrandSchemas = {
  createBrand,
  updateBrand,
};
