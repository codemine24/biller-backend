import z from "zod";
import { CategorySchemas } from "./Category.schemas";

export type CreateCategoryPayload = z.infer<typeof CategorySchemas.createCategory>['body']

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  icon?: string;
  description?: string;
}
