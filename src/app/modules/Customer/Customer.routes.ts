import { Router } from "express";
import auth from "../../middlewares/auth";
import { CustomerControllers } from "./Customer.controllers";
import { CustomerSchemas } from "./Customer.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  payloadValidator(CustomerSchemas.createCustomer),
  CustomerControllers.createCustomer
);

router.get(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  CustomerControllers.getCustomers
);

router.get(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  CustomerControllers.getCustomer
);

router.patch(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  payloadValidator(CustomerSchemas.updateCustomer),
  CustomerControllers.updateCustomer
);

router.delete(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  CustomerControllers.deleteCustomer
);

export const CustomerRoutes = router;
