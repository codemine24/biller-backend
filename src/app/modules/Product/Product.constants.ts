import { sortOrderType } from "../../constants/common";

export const productFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "is_active",
  "category_id",
  "brand_id",
  "from_date",
  "to_date",
];

export const productSearchableFields = [
  "name",
  "slug",
  "description",
  "unit",
];

export const productSortableFields = [
  "name",
  "cost_price",
  "selling_price",
  "reorder_level",
  "created_at",
  "updated_at",
];

export const productQueryValidationConfig = {
  sort_by: productSortableFields,
  sort_order: sortOrderType,
  is_active: ["true", "false"],
};
