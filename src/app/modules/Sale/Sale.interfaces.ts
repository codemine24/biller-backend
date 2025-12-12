import z from "zod";
import { SaleSchemas } from "./Sale.schemas";

export type CreateSalePayload = z.infer<typeof SaleSchemas.createSale>['body']

export interface UpdateSalePayload {
  customer_id?: string | null;
  store_id?: string;
  sale_date?: Date;
  subtotal?: number;
  discount?: number;
  tax?: number;
  total_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  status?: "COMPLETED" | "CANCELLED" | "RETURNED";
  notes?: string;
  items?: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
}
