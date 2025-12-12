import { Router } from "express";
import auth from "../../middlewares/auth";
import { SaleReturnControllers } from "./SaleReturn.controllers";
import { SaleReturnSchemas } from "./SaleReturn.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(SaleReturnSchemas.createSaleReturn),
  SaleReturnControllers.createSaleReturn
);

router.get(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  SaleReturnControllers.getSaleReturns
);

router.get(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  SaleReturnControllers.getSaleReturn
);

router.patch(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(SaleReturnSchemas.updateSaleReturn),
  SaleReturnControllers.updateSaleReturn
);

router.delete(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN),
  SaleReturnControllers.deleteSaleReturn
);

export const SaleReturnRoutes = router;
