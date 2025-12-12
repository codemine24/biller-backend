import { sortOrderType } from "../../constants/common";

export const purchaseReturnFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "status",
  "purchase_id",
  "store_id",
  "from_date",
  "to_date",
];

export const purchaseReturnSearchableFields = [
  "return_number",
  "reason",
  "notes",
];

export const purchaseReturnSortableFields = [
  "return_number",
  "return_date",
  "refund_amount",
  "created_at",
  "updated_at",
];

export const purchaseReturnQueryValidationConfig = {
  sort_by: purchaseReturnSortableFields,
  sort_order: sortOrderType,
  status: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
};
