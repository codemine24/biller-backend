import z from "zod";
import { VendorSchemas } from "./Vendor.schemas";

export type CreateVendorPayload = z.infer<typeof VendorSchemas.createVendor>['body']

export interface UpdateVendorPayload {
  name?: string;
  email?: string;
  contact_number?: string;
  address?: string;
  is_active?: boolean;
  total_due?: number;
}
