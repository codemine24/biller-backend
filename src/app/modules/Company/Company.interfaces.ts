import z from "zod";
import { CompanySchemas } from "./Company.schemas";

export type CreateCompanyPayload = z.infer<typeof CompanySchemas.subscribe>['body'];

export type UpdateCompanyBySuperAdminPayload = z.infer<typeof CompanySchemas.updateCompanyBySuperAdmin>['body'];

export type UpdateCompanyBySelfPayload = z.infer<typeof CompanySchemas.updateCompanyBySelf>['body'];
