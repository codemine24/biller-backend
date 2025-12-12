import { Router } from "express";
import auth from "../../middlewares/auth";
import { PurchaseReturnControllers } from "./PurchaseReturn.controllers";
import { PurchaseReturnSchemas } from "./PurchaseReturn.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(PurchaseReturnSchemas.createPurchaseReturn),
  PurchaseReturnControllers.createPurchaseReturn
);

router.get(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  PurchaseReturnControllers.getPurchaseReturns
);

router.get(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  PurchaseReturnControllers.getPurchaseReturn
);

router.patch(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(PurchaseReturnSchemas.updatePurchaseReturn),
  PurchaseReturnControllers.updatePurchaseReturn
);

router.delete(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN),
  PurchaseReturnControllers.deletePurchaseReturn
);

export const PurchaseReturnRoutes = router;
