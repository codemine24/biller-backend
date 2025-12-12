import { Router } from "express";
import auth from "../../middlewares/auth";
import { SaleControllers } from "./Sale.controllers";
import { SaleSchemas } from "./Sale.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  payloadValidator(SaleSchemas.createSale),
  SaleControllers.createSale
);

router.get(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  SaleControllers.getSales
);

router.get(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  SaleControllers.getSale
);

router.patch(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(SaleSchemas.updateSale),
  SaleControllers.updateSale
);

router.delete(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN),
  SaleControllers.deleteSale
);

export const SaleRoutes = router;
