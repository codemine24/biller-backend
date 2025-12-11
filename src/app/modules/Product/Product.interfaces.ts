import z from "zod";
import { ProductSchemas } from "./Product.schemas";

export type CreateProductPayload = z.infer<typeof ProductSchemas.createProduct>['body']

export interface UpdateProductPayload {
  name?: string;
  slug?: string;
  description?: string;
  category_id?: string | null;
  brand_id?: string | null;
  unit?: string;
  cost_price?: number;
  selling_price?: number;
  reorder_level?: number;
  is_active?: boolean;
}
