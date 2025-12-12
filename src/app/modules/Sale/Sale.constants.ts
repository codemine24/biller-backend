import { sortOrderType } from "../../constants/common";

export const saleFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "status",
  "customer_id",
  "store_id",
  "from_date",
  "to_date",
];

export const saleSearchableFields = [
  "invoice_number",
  "notes",
];

export const saleSortableFields = [
  "invoice_number",
  "sale_date",
  "subtotal",
  "total_amount",
  "paid_amount",
  "due_amount",
  "created_at",
  "updated_at",
];

export const saleQueryValidationConfig = {
  sort_by: saleSortableFields,
  sort_order: sortOrderType,
  status: ["COMPLETED", "CANCELLED", "RETURNED"],
};
