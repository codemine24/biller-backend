import { UserRole, UserStatus } from "../../../../prisma/generated/enums";
import { sortOrderType } from "../../constants/common";

export const userFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sortBy",
  "sortOrder",
  "role",
  "status",
  "from_date",
  "to_date",
];

export const userSearchableFields = [
  "first_name",
  "last_name",
  "email",
  "contact_number",
];

export const userSortableFields = [
  "id",
  "first_name",
  "last_name",
  "email",
  "contact_number",
  "created_at",
  "updated_at",
  "role",
  "status",
];

export const userSelectedFields = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  contact_number: true,
  role: true,
  status: true,
  avatar: true,
  created_at: true,
  updated_at: true,
};

export const userQueryValidationConfig = {
  sort_by: userSortableFields,
  sort_order: sortOrderType,
  role: Object.values(UserRole),
  status: Object.values(UserStatus),
};
