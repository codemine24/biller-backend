import { sortOrderType } from "../../constants/common";

export const purchaseFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "status",
  "vendor_id",
  "store_id",
  "from_date",
  "to_date",
];

export const purchaseSearchableFields = [
  "invoice_number",
  "notes",
];

export const purchaseSortableFields = [
  "invoice_number",
  "purchase_date",
  "total_amount",
  "paid_amount",
  "due_amount",
  "created_at",
  "updated_at",
];

export const purchaseQueryValidationConfig = {
  sort_by: purchaseSortableFields,
  sort_order: sortOrderType,
  status: ["PENDING", "COMPLETED", "CANCELLED"],
};
