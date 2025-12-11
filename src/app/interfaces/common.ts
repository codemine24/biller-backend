import { UserRole } from "../../../prisma/generated";


export type TAuthUser = {
  id: string;
  contact_number: string;
  email: string;
  role: UserRole;
  subscriber_id: string;
  iat: number;
  exp: number;
};
