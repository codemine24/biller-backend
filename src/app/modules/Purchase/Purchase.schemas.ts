import { z } from "zod";
import { PurchaseStatus } from "../../../../prisma/generated";
import { enumMessageGenerator } from "../../utils/helper";

const purchaseItemSchema = z.object({
  product_id: z.uuid({ message: "Product ID must be a valid UUID" }),
  quantity: z.number({message: "Quantity must be a number"}).int().positive({ message: "Quantity must be a positive integer" }),
  unit_price: z.number({message: "Unit price must be a number"}).nonnegative({ message: "Unit price must be non-negative" }),
});

const createPurchase = z.object({
  body: z
    .object({
      vendor_id: z.uuid({ message: "Vendor ID must be a valid UUID" }),
      store_id: z.uuid({ message: "Store ID must be a valid UUID" }),
      purchase_date: z.string().datetime({ message: "Purchase date must be a valid datetime" }).optional(),
      paid_amount: z.number().nonnegative({ message: "Paid amount must be non-negative" }).optional(),
      status: z.enum(Object.values(PurchaseStatus), {
        message: enumMessageGenerator('status', Object.values(PurchaseStatus)),
      }).default(PurchaseStatus.PENDING),
      notes: z.string().optional(),
      items: z.array(purchaseItemSchema, {
        message: "Items must be an array and is required",
      }).min(1, "At least one item is required"),
    })
    .strict(),
});

const updatePurchase = z.object({
  body: z
    .object({
      vendor_id: z.uuid({ message: "Vendor ID must be a valid UUID" }).optional(),
      store_id: z.uuid({ message: "Store ID must be a valid UUID" }).optional(),
      purchase_date: z.string().datetime({ message: "Purchase date must be a valid datetime" }).optional(),
      total_amount: z.number().nonnegative({ message: "Total amount must be non-negative" }).optional(),
      paid_amount: z.number().nonnegative({ message: "Paid amount must be non-negative" }).optional(),
      due_amount: z.number().nonnegative({ message: "Due amount must be non-negative" }).optional(),
      status: z.enum(Object.values(PurchaseStatus), {
        message: enumMessageGenerator('status', Object.values(PurchaseStatus)),
      }).optional(),
      notes: z.string().optional(),
      items: z.array(purchaseItemSchema).optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.vendor_id ||
        data.store_id ||
        data.purchase_date ||
        data.total_amount !== undefined ||
        data.paid_amount !== undefined ||
        data.due_amount !== undefined ||
        data.status ||
        data.notes !== undefined ||
        data.items,
      {
        message: "At least one field must be provided for update",
      }
    ),
});

export const PurchaseSchemas = {
  createPurchase,
  updatePurchase,
};
