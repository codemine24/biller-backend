import { Router } from "express";
import auth from "../../middlewares/auth";
import { CategoryControllers } from "./Category.controllers";
import { CategorySchemas } from "./Category.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(CategorySchemas.createCategory),
  CategoryControllers.createCategory
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  CategoryControllers.getCategories
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  CategoryControllers.getCategory
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(CategorySchemas.updateCategory),
  CategoryControllers.updateCategory
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN),
  CategoryControllers.deleteCategory
);

export const CategoryRoutes = router;
