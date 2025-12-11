import z from "zod";
import { BrandSchemas } from "./Brand.schemas";

export type CreateBrandPayload = z.infer<typeof BrandSchemas.createBrand>['body']

export interface UpdateBrandPayload {
  name?: string;
  slug?: string;
  logo?: string;
  description?: string;
}
