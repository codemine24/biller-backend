import { Router } from "express";
import auth from "../../middlewares/auth";
import { TransferControllers } from "./Transfer.controllers";
import { TransferSchemas } from "./Transfer.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(TransferSchemas.createTransfer),
  TransferControllers.createTransfer
);

router.get(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  TransferControllers.getTransfers
);

router.get(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  TransferControllers.getTransfer
);

router.patch(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(TransferSchemas.updateTransfer),
  TransferControllers.updateTransfer
);

router.delete(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN),
  TransferControllers.deleteTransfer
);

export const TransferRoutes = router;
