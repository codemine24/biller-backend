import z from "zod";
import { PurchaseReturnSchemas } from "./PurchaseReturn.schemas";

export type CreatePurchaseReturnPayload = z.infer<typeof PurchaseReturnSchemas.createPurchaseReturn>['body']

export interface UpdatePurchaseReturnPayload {
  purchase_id?: string;
  store_id?: string;
  return_date?: Date;
  reason?: string;
  refund_amount?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  notes?: string;
  items?: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
}
