import { Router } from "express";
import auth from "../../middlewares/auth";
import { AuthControllers } from "./Auth.controllers";
import { AuthSchemas } from "./Auth.schemas";
import { UserRole } from "../../../generated/prisma/enums";
import payloadValidator from "../../middlewares/payload-validator";

const router = Router();

router.post(
  "/send-otp",
  payloadValidator(AuthSchemas.createOTP),
  AuthControllers.createOTP
);

router.post(
  "/register",
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
  auth(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.RETAILER,
    UserRole.CONSUMER
  ),
  payloadValidator(AuthSchemas.resetPassword),
  AuthControllers.resetPassword
);

router.post(
  "/forgot-password",
  payloadValidator(AuthSchemas.forgotPassword),
  AuthControllers.forgotPassword
);

export const AuthRoutes = router;
