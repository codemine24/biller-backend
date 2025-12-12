import { sortOrderType } from "../../constants/common";

export const saleReturnFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "status",
  "sale_id",
  "store_id",
  "from_date",
  "to_date",
];

export const saleReturnSearchableFields = [
  "return_number",
  "reason",
  "notes",
];

export const saleReturnSortableFields = [
  "return_number",
  "return_date",
  "refund_amount",
  "created_at",
  "updated_at",
];

export const saleReturnQueryValidationConfig = {
  sort_by: saleReturnSortableFields,
  sort_order: sortOrderType,
  status: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
};
