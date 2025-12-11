import { Router } from "express";
import auth from "../../middlewares/auth";
import { CompanyControllers } from "./Company.controllers";
import { CompanySchemas } from "./Company.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

router.post(
  "/subscribe",
  payloadValidator(CompanySchemas.createCompany),
  CompanyControllers.createCompany
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN),
  CompanyControllers.getCompanies
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN),
  CompanyControllers.getCompany
);

router.patch(
  "/profile/:id",
  auth(UserRole.OWNER),
  payloadValidator(CompanySchemas.updateCompanyBySelf),
  CompanyControllers.updateCompanyBySelf
);

router.patch(
  "/:id",
  // auth(UserRole.SUPER_ADMIN),
  payloadValidator(CompanySchemas.updateCompanyBySuperAdmin),
  CompanyControllers.updateCompanyBySuperAdmin
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN),
  CompanyControllers.deleteCompany
);

export const CompanyRoutes = router;
