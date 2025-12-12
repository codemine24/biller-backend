import { Router } from "express";
import auth from "../../middlewares/auth";
import { StoreControllers } from "./Store.controllers";
import { StoreSchemas } from "./Store.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN),
  payloadValidator(StoreSchemas.createStore),
  StoreControllers.createStore
);

router.get(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  StoreControllers.getStores
);

router.get(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  StoreControllers.getStore
);

router.patch(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN),
  payloadValidator(StoreSchemas.updateStore),
  StoreControllers.updateStore
);

router.delete(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN),
  StoreControllers.deleteStore
);

export const StoreRoutes = router;
