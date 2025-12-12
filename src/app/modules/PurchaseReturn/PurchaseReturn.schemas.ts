import { z } from "zod";

const purchaseReturnItemSchema = z.object({
  product_id: z.uuid({ message: "Product ID must be a valid UUID" }),
  quantity: z.number({message: "Quantity must be a number"}).int().positive({ message: "Quantity must be a positive integer" }),
  unit_price: z.number({message: "Unit price must be a number"}).nonnegative({ message: "Unit price must be non-negative" }),
}).strict();

const createPurchaseReturn = z.object({
  body: z
    .object({
      purchase_id: z.uuid({ message: "Purchase ID must be a valid UUID" }),
      store_id: z.uuid({ message: "Store ID must be a valid UUID" }),
      return_date: z.string().datetime({ message: "Return date must be a valid datetime" }).optional(),
      reason: z.string({message: "Reason is required"}).min(1, "Reason is required"),
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED"], {
        message: "Status must be PENDING, APPROVED, REJECTED, or COMPLETED",
      }).default("PENDING"),
      notes: z.string().optional(),
      items: z.array(purchaseReturnItemSchema, {
        message: "Items must be an array and is required",
      }).min(1, "At least one item is required"),
    })
    .strict(),
});

const updatePurchaseReturn = z.object({
  body: z
    .object({
      purchase_id: z.uuid({ message: "Purchase ID must be a valid UUID" }).optional(),
      store_id: z.uuid({ message: "Store ID must be a valid UUID" }).optional(),
      return_date: z.string().datetime({ message: "Return date must be a valid datetime" }).optional(),
      reason: z.string({message: "Reason is required"}).min(1, "Reason is required").optional(),
      refund_amount: z.number().nonnegative({ message: "Refund amount must be non-negative" }).optional(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED"], {
        message: "Status must be PENDING, APPROVED, REJECTED, or COMPLETED",
      }).optional(),
      notes: z.string().optional(),
      items: z.array(purchaseReturnItemSchema).optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.purchase_id ||
        data.store_id ||
        data.return_date ||
        data.reason ||
        data.refund_amount !== undefined ||
        data.status ||
        data.notes !== undefined ||
        data.items,
      {
        message: "At least one field must be provided for update",
      }
    ),
});

export const PurchaseReturnSchemas = {
  createPurchaseReturn,
  updatePurchaseReturn,
};
