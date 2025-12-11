import { Router } from "express";
import auth from "../../middlewares/auth";
import { AuthControllers } from "./Auth.controllers";
import { AuthSchemas } from "./Auth.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/register",
  auth(UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  payloadValidator(AuthSchemas.register),
  AuthControllers.register
);

router.post(
  "/login",
  payloadValidator(AuthSchemas.login),
  AuthControllers.login
);

router.post("/access-token", AuthControllers.getAccessToken);

router.post(
  "/reset-password",
 auth(UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  payloadValidator(AuthSchemas.resetPassword),
  AuthControllers.resetPassword
);

router.post(
  "/forgot-password",
  payloadValidator(AuthSchemas.forgotPassword),
  AuthControllers.forgotPassword
);

export const AuthRoutes = router;
