import { sortOrderType } from "../../constants/common";

export const transferFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "status",
  "from_store_id",
  "to_store_id",
  "from_date",
  "to_date",
];

export const transferSearchableFields = [
  "transfer_number",
  "notes",
];

export const transferSortableFields = [
  "transfer_number",
  "transfer_date",
  "created_at",
  "updated_at",
];

export const transferQueryValidationConfig = {
  sort_by: transferSortableFields,
  sort_order: sortOrderType,
  status: ["PENDING", "IN_TRANSIT", "COMPLETED", "CANCELLED"],
};
