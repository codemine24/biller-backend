import { UserRole, UserStatus } from "../../../generated/prisma/enums";

export interface UpdateUserByAdminPayload {
  role?: UserRole;
  status?: UserStatus;
  is_deleted?: boolean;
}

export interface AddUserByAdminPayload {
  name: string;
  email?: string;
  contact_number: string;
  role: UserRole;
}
