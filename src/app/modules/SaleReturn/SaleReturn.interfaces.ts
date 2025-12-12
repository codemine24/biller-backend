import z from "zod";
import { SaleReturnSchemas } from "./SaleReturn.schemas";

export type CreateSaleReturnPayload = z.infer<typeof SaleReturnSchemas.createSaleReturn>['body']

export interface UpdateSaleReturnPayload {
  sale_id?: string;
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
