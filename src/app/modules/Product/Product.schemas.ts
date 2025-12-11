import { z } from "zod";

const createProduct = z.object({
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
          message: "Slug must be lowercase with hyphens only (e.g., product-name)",
        })
        .optional(),
      description: z.string().optional(),
      category_id: z.string().uuid({ message: "Category ID must be a valid UUID" }).optional(),
      brand_id: z.string().uuid({ message: "Brand ID must be a valid UUID" }).optional(),
      unit: z
        .string({
          message: "Unit is required",
        })
        .min(1, "Unit cannot be empty"),
      cost_price: z
        .number({ message: "Cost price must be a number" })
        .nonnegative({ message: "Cost price must be non-negative" })
        .default(0),
      selling_price: z
        .number({ message: "Selling price must be a number" })
        .nonnegative({ message: "Selling price must be non-negative" })
        .default(0),
      reorder_level: z
        .number({ message: "Reorder level must be a number" })
        .int({ message: "Reorder level must be an integer" })
        .nonnegative({ message: "Reorder level must be non-negative" })
        .default(0),
    })
    .strict(),
});

const updateProduct = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name cannot be empty").optional(),
      slug: z
        .string()
        .min(1, "Slug cannot be empty")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
          message: "Slug must be lowercase with hyphens only (e.g., product-name)",
        })
        .optional(),
      description: z.string().optional(),
      category_id: z.string().uuid({ message: "Category ID must be a valid UUID" }).nullable().optional(),
      brand_id: z.string().uuid({ message: "Brand ID must be a valid UUID" }).nullable().optional(),
      unit: z.string().min(1, "Unit cannot be empty").optional(),
      cost_price: z
        .number({ message: "Cost price must be a number" })
        .nonnegative({ message: "Cost price must be non-negative" })
        .optional(),
      selling_price: z
        .number({ message: "Selling price must be a number" })
        .nonnegative({ message: "Selling price must be non-negative" })
        .optional(),
      reorder_level: z
        .number({ message: "Reorder level must be a number" })
        .int({ message: "Reorder level must be an integer" })
        .nonnegative({ message: "Reorder level must be non-negative" })
        .optional(),
      is_active: z.boolean().optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.name ||
        data.slug ||
        data.description !== undefined ||
        data.category_id !== undefined ||
        data.brand_id !== undefined ||
        data.unit ||
        data.cost_price !== undefined ||
        data.selling_price !== undefined ||
        data.reorder_level !== undefined ||
        data.is_active !== undefined,
      {
        message: "At least one field must be provided for update",
      }
    ),
});

export const ProductSchemas = {
  createProduct,
  updateProduct,
};
