import { z } from "zod";
import { ReturnStatus } from "../../../../prisma/generated";
import { enumMessageGenerator } from "../../utils/helper";

const saleReturnItemSchema = z.object({
  product_id: z.uuid({ message: "Product ID must be a valid UUID" }),
  quantity: z.number({message: "Quantity must be a number"}).int().positive({ message: "Quantity must be a positive integer" }),
  unit_price: z.number({message: "Unit price must be a number"}).nonnegative({ message: "Unit price must be non-negative" }),
}).strict();

const createSaleReturn = z.object({
  body: z
    .object({
      sale_id: z.uuid({ message: "Sale ID must be a valid UUID" }),
      store_id: z.uuid({ message: "Store ID must be a valid UUID" }),
      return_date: z.string().datetime({ message: "Return date must be a valid datetime" }).optional(),
      reason: z.string({message: "Reason is required"}).min(1, "Reason is required"),
      status: z.enum(Object.values(ReturnStatus), {
        message: enumMessageGenerator('status', Object.values(ReturnStatus)),
      }).default(ReturnStatus.PENDING),
      notes: z.string().optional(),
      items: z.array(saleReturnItemSchema, {
        message: "Items must be an array and is required",
      }).min(1, "At least one item is required"),
    })
    .strict(),
});

const updateSaleReturn = z.object({
  body: z
    .object({
      sale_id: z.uuid({ message: "Sale ID must be a valid UUID" }).optional(),
      store_id: z.uuid({ message: "Store ID must be a valid UUID" }).optional(),
      return_date: z.string().datetime({ message: "Return date must be a valid datetime" }).optional(),
      reason: z.string({message: "Reason is required"}).min(1, "Reason is required").optional(),
      refund_amount: z.number().nonnegative({ message: "Refund amount must be non-negative" }).optional(),
      status: z.enum(Object.values(ReturnStatus), {
        message: enumMessageGenerator('status', Object.values(ReturnStatus)),
      }).optional(),
      notes: z.string().optional(),
      items: z.array(saleReturnItemSchema).optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.sale_id ||
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

export const SaleReturnSchemas = {
  createSaleReturn,
  updateSaleReturn,
};
