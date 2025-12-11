import { Router } from "express";
import auth from "../../middlewares/auth";
import { ProductControllers } from "./Product.controllers";
import { ProductSchemas } from "./Product.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(ProductSchemas.createProduct),
  ProductControllers.createProduct
);

router.get(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  ProductControllers.getProducts
);

router.get(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  ProductControllers.getProduct
);

router.patch(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(ProductSchemas.updateProduct),
  ProductControllers.updateProduct
);

router.delete(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN),
  ProductControllers.deleteProduct
);

export const ProductRoutes = router;
