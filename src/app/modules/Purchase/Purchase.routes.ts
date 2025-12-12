import { Router } from "express";
import auth from "../../middlewares/auth";
import { PurchaseControllers } from "./Purchase.controllers";
import { PurchaseSchemas } from "./Purchase.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(PurchaseSchemas.createPurchase),
  PurchaseControllers.createPurchase
);

router.get(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  PurchaseControllers.getPurchases
);

router.get(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  PurchaseControllers.getPurchase
);

router.patch(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(PurchaseSchemas.updatePurchase),
  PurchaseControllers.updatePurchase
);

router.delete(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN),
  PurchaseControllers.deletePurchase
);

export const PurchaseRoutes = router;
