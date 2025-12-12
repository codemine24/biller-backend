import { sortOrderType } from "../../constants/common";

export const storeFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "is_active",
  "from_date",
  "to_date",
];

export const storeSearchableFields = [
  "name",
  "address",
  "contact_number",
];

export const storeSortableFields = [
  "name",
  "created_at",
  "updated_at",
];

export const storeQueryValidationConfig = {
  sort_by: storeSortableFields,
  sort_order: sortOrderType,
  is_active: ["true", "false"],
};
