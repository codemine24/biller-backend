import { z } from "zod";
import { SaleStatus } from "../../../../prisma/generated";
import { enumMessageGenerator } from "../../utils/helper";

const saleItemSchema = z.object({
  product_id: z.uuid({ message: "Product ID must be a valid UUID" }),
  quantity: z.number({message: "Quantity must be a number"}).int().positive({ message: "Quantity must be a positive integer" }),
  unit_price: z.number({message: "Unit price must be a number"}).nonnegative({ message: "Unit price must be non-negative" }),
});

const createSale = z.object({
  body: z
    .object({
      customer_id: z.uuid({ message: "Customer ID must be a valid UUID" }).optional().nullable(),
      store_id: z.uuid({ message: "Store ID must be a valid UUID" }),
      sale_date: z.string().datetime({ message: "Sale date must be a valid datetime" }).optional(),
      discount: z.number({message: "Discount must be a number"}).nonnegative({ message: "Discount must be non-negative" }).default(0),
      tax: z.number({message: "Tax must be a number"}).nonnegative({ message: "Tax must be non-negative" }).default(0),
      paid_amount: z.number({message: "Paid amount must be a number"}).nonnegative({ message: "Paid amount must be non-negative" }).optional(),
      status: z.enum(Object.values(SaleStatus), {
        message: enumMessageGenerator('status', Object.values(SaleStatus)),
      }).default(SaleStatus.COMPLETED),
      notes: z.string().optional(),
      items: z.array(saleItemSchema, {
        message: "Items must be an array and is required",
      }).min(1, "At least one item is required"),
    })
    .strict(),
});

const updateSale = z.object({
  body: z
    .object({
      customer_id: z.uuid({ message: "Customer ID must be a valid UUID" }).optional().nullable(),
      store_id: z.uuid({ message: "Store ID must be a valid UUID" }).optional(),
      sale_date: z.string().datetime({ message: "Sale date must be a valid datetime" }).optional(),
      subtotal: z.number().nonnegative({ message: "Subtotal must be non-negative" }).optional(),
      discount: z.number().nonnegative({ message: "Discount must be non-negative" }).optional(),
      tax: z.number().nonnegative({ message: "Tax must be non-negative" }).optional(),
      total_amount: z.number().nonnegative({ message: "Total amount must be non-negative" }).optional(),
      paid_amount: z.number().nonnegative({ message: "Paid amount must be non-negative" }).optional(),
      due_amount: z.number().nonnegative({ message: "Due amount must be non-negative" }).optional(),
      status: z.enum(Object.values(SaleStatus), {
        message: enumMessageGenerator('status', Object.values(SaleStatus)),
      }).optional(),
      notes: z.string().optional(),
      items: z.array(saleItemSchema).optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.customer_id !== undefined ||
        data.store_id ||
        data.sale_date ||
        data.subtotal !== undefined ||
        data.discount !== undefined ||
        data.tax !== undefined ||
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

export const SaleSchemas = {
  createSale,
  updateSale,
};
