import { sortOrderType } from "../../constants/common";

export const vendorFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "is_active",
  "from_date",
  "to_date",
];

export const vendorSearchableFields = [
  "name",
  "email",
  "contact_number",
  "address",
];

export const vendorSortableFields = [
  "name",
  "email",
  "total_due",
  "created_at",
  "updated_at",
];

export const vendorQueryValidationConfig = {
  sort_by: vendorSortableFields,
  sort_order: sortOrderType,
  is_active: ["true", "false"],
};
