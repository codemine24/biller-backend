import z from "zod";
import { CustomerSchemas } from "./Customer.schemas";

// export interface CreateCustomerPayload {
//   name: string;
//   email?: string;
//   contact_number: string;
//   address?: string;
//   company_id: string;
// }

export type CreateCustomerPayload = z.infer<typeof CustomerSchemas.createCustomer>['body']

export interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  contact_number?: string;
  address?: string;
  is_active?: boolean;
  total_due?: number;
}
