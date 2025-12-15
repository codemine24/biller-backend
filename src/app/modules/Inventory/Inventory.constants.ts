import { sortOrderType } from "../../constants/common";

export const inventoryFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "store_id",
  "product_id",
  "from_date",
  "to_date",
];

export const inventorySearchableFields = [
  "product.name",
];

export const inventorySortableFields = [
  "quantity",
  "last_updated",
  "created_at",
];

export const inventoryQueryValidationConfig = {
  sort_by: inventorySortableFields,
  sort_order: sortOrderType,
};
