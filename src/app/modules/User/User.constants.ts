import { sortOrderType } from "../../constants/common";

export const userFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "role",
  "status",
  "company_id",
];

export const userSearchableFields = [
  "name",
  "email",
  "contact_number",
];

export const userSortableFields = [
  "name",
  "email",
  "contact_number",
  "role",
  "created_at",
  "updated_at",
];

export const userQueryValidationConfig = {
  sort_by: userSortableFields,
  sort_order: sortOrderType,
  role: ["SUPER_ADMIN", "OWNER", "ADMIN", "BRANCH_MANAGER", "SALESMAN"],
  status: ["ACTIVE", "BLOCKED"],
};

export const userSelectedFields = {
  id: true,
  name: true,
  email: true,
  contact_number: true,
  avatar: true,
  role: true,
  status: true,
  company_id: true,
  created_at: true,
  updated_at: true,
}
