import z from "zod";
import { PurchaseSchemas } from "./Purchase.schemas";

export type CreatePurchasePayload = z.infer<typeof PurchaseSchemas.createPurchase>['body']

export interface UpdatePurchasePayload {
  vendor_id?: string;
  store_id?: string;
  purchase_date?: Date;
  total_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  status?: "PENDING" | "COMPLETED" | "CANCELLED";
  notes?: string;
  items?: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}
