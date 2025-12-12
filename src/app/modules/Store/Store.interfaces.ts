import z from "zod";
import { StoreSchemas } from "./Store.schemas";

export type CreateStorePayload = z.infer<typeof StoreSchemas.createStore>['body']

export interface UpdateStorePayload {
  name?: string;
  address?: string;
  contact_number?: string;
  is_active?: boolean;
}
