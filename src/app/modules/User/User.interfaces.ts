import z from "zod";
import { UserSchemas } from "./User.schemas";

export type CreateUserPayload = z.infer<typeof UserSchemas.createUser>['body']

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  contact_number?: string;
  avatar?: string;
  role?: "SUPER_ADMIN" | "OWNER" | "ADMIN" | "BRANCH_MANAGER" | "SALESMAN";
  status?: "ACTIVE" | "BLOCKED";
}
