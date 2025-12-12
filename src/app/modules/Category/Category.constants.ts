import { sortOrderType } from "../../constants/common";

export const categoryFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "from_date",
  "to_date",
];

export const categorySearchableFields = [
  "name",
  "slug",
  "description",
];

export const categorySortableFields = [
  "name",
  "created_at",
  "updated_at",
];

export const categoryQueryValidationConfig = {
  sort_by: categorySortableFields,
  sort_order: sortOrderType,
};
