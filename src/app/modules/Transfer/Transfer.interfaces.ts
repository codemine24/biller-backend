import z from "zod";
import { TransferSchemas } from "./Transfer.schemas";

export type CreateTransferPayload = z.infer<typeof TransferSchemas.createTransfer>['body']

export interface UpdateTransferPayload {
  from_store_id?: string;
  to_store_id?: string;
  transfer_date?: Date;
  status?: "PENDING" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";
  notes?: string;
  items?: Array<{
    product_id: string;
    quantity: number;
  }>;
}
