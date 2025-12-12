import { z } from "zod";

const transferItemSchema = z.object({
  product_id: z.uuid({ message: "Product ID must be a valid UUID" }),
  quantity: z.number({message: "Quantity must be a number"}).int().positive({ message: "Quantity must be a positive integer" }),
}).strict();

const createTransfer = z.object({
  body: z
    .object({
      from_store_id: z.uuid({ message: "From store ID must be a valid UUID" }),
      to_store_id: z.uuid({ message: "To store ID must be a valid UUID" }),
      transfer_date: z.string().datetime({ message: "Transfer date must be a valid datetime" }).optional(),
      status: z.enum(["PENDING", "IN_TRANSIT", "COMPLETED", "CANCELLED"], {
        message: "Status must be PENDING, IN_TRANSIT, COMPLETED, or CANCELLED",
      }).default("PENDING"),
      notes: z.string().optional(),
      items: z.array(transferItemSchema, {
        message: "Items must be an array and is required",
      }).min(1, "At least one item is required"),
    })
    .strict()
    .refine((data) => data.from_store_id !== data.to_store_id, {
      message: "From store and to store cannot be the same",
      path: ["to_store_id"],
    }),
});

const updateTransfer = z.object({
  body: z
    .object({
      from_store_id: z.uuid({ message: "From store ID must be a valid UUID" }).optional(),
      to_store_id: z.uuid({ message: "To store ID must be a valid UUID" }).optional(),
      transfer_date: z.string().datetime({ message: "Transfer date must be a valid datetime" }).optional(),
      status: z.enum(["PENDING", "IN_TRANSIT", "COMPLETED", "CANCELLED"], {
        message: "Status must be PENDING, IN_TRANSIT, COMPLETED, or CANCELLED",
      }).optional(),
      notes: z.string().optional(),
      items: z.array(transferItemSchema).optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.from_store_id ||
        data.to_store_id ||
        data.transfer_date ||
        data.status ||
        data.notes !== undefined ||
        data.items,
      {
        message: "At least one field must be provided for update",
      }
    ),
});

export const TransferSchemas = {
  createTransfer,
  updateTransfer,
};
