import z from "zod";
import { AuthSchemas } from "./Auth.schemas";

export type TRegister = z.infer<typeof AuthSchemas.register>["body"];
export type TLogin = z.infer<typeof AuthSchemas.login>["body"];

export interface ResetPasswordPayload {
  old_password: string;
  new_password: string;
}
