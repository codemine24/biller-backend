import { Router } from "express";
import auth from "../../middlewares/auth";
import { VendorControllers } from "./Vendor.controllers";
import { VendorSchemas } from "./Vendor.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(VendorSchemas.createVendor),
  VendorControllers.createVendor
);

router.get(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  VendorControllers.getVendors
);

router.get(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  VendorControllers.getVendor
);

router.patch(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(VendorSchemas.updateVendor),
  VendorControllers.updateVendor
);

router.delete(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN),
  VendorControllers.deleteVendor
);

export const VendorRoutes = router;
