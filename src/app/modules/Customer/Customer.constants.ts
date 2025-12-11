import { sortOrderType } from "../../constants/common";

export const customerFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "is_active",
  "from_date",
  "to_date",
];

export const customerSearchableFields = [
  "name",
  "email",
  "contact_number",
  "address",
];

export const customerSortableFields = [
  "id",
  "name",
  "email",
  "contact_number",
  "total_due",
  "created_at",
  "updated_at",
];

export const customerQueryValidationConfig = {
  sort_by: customerSortableFields,
  sort_order: sortOrderType,
  is_active: ["true", "false"],
};
