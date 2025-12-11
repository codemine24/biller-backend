import { sortOrderType } from "../../constants/common";

export const brandFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "from_date",
  "to_date",
];

export const brandSearchableFields = [
  "name",
  "slug",
  "description",
];

export const brandSortableFields = [
  "name",
  "created_at",
  "updated_at",
];

export const brandQueryValidationConfig = {
  sort_by: brandSortableFields,
  sort_order: sortOrderType,
};
