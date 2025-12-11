import { sortOrderType } from "../../constants/common";

export const companyFilterableFields = [
  "search_term",
  "limit",
  "page",
  "sort_by",
  "sort_order",
  "status",
  "from_date",
  "to_date",
];

export const companySearchableFields = [
  "name",
  "address",
];

export const companySortableFields = [
  "id",
  "name",
  "address",
  "status",
  "created_at",
  "updated_at",
];

export const companyQueryValidationConfig = {
  sort_by: companySortableFields,
  sort_order: sortOrderType,
  status: ["ACTIVE", "BLOCKED", "HOLD"],
};
