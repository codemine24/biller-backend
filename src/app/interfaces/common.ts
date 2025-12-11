import { UserRole } from "../../../prisma/generated";


export type TAuthUser = {
  id: string;
  name: string;
  avatar: string;
  contact_number: string;
  email: string;
  role: UserRole
  company_id: string | null;
  iat: number;
  exp: number;
};
