import { Router } from "express";
import auth from "../../middlewares/auth";
import { BrandControllers } from "./Brand.controllers";
import { BrandSchemas } from "./Brand.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(BrandSchemas.createBrand),
  BrandControllers.createBrand
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  BrandControllers.getBrands
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  BrandControllers.getBrand
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(BrandSchemas.updateBrand),
  BrandControllers.updateBrand
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN),
  BrandControllers.deleteBrand
);

export const BrandRoutes = router;
