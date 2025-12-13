import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserControllers } from "./User.controllers";
import { UserSchemas } from "./User.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(UserSchemas.createUser),
  UserControllers.createUser
);

router.get(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  UserControllers.getUsers
);

router.get(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  UserControllers.getUser
);

router.patch(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  payloadValidator(UserSchemas.updateUser),
  UserControllers.updateUser
);

router.delete(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN),
  UserControllers.deleteUser
);

export const UserRoutes = router;
