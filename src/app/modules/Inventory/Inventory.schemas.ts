import { z } from "zod";

const createInventory = z.object({
  body: z
    .object({
      product_id: z
        .string({
          message: "Product ID is required",
        })
        .uuid({ message: "Product ID must be a valid UUID" }),
      store_id: z
        .string({
          message: "Store ID is required",
        })
        .uuid({ message: "Store ID must be a valid UUID" }),
      quantity: z
        .number({
          message: "Quantity is required",
        })
        .int({ message: "Quantity must be an integer" })
        .nonnegative({ message: "Quantity must be non-negative" })
        .default(0),
    })
    .strict(),
});

const updateInventory = z.object({
  body: z
    .object({
      quantity: z
        .number({
          message: "Quantity is required",
        })
        .int({ message: "Quantity must be an integer" })
        .nonnegative({ message: "Quantity must be non-negative" }),
    })
    .strict(),
});

const adjustInventory = z.object({
  body: z
    .object({
      adjustment_quantity: z
        .number({
          message: "Adjustment quantity is required",
        })
        .int({ message: "Adjustment quantity must be an integer" }),
      reason: z
        .string({
          message: "Reason is required for inventory adjustment",
        })
        .min(1, "Reason cannot be empty"),
    })
    .strict(),
});

export const InventorySchemas = {
  createInventory,
  updateInventory,
  adjustInventory,
};
