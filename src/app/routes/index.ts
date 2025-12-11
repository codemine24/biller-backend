import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/Auth.routes";
import { CustomerRoutes } from "../modules/Customer/Customer.routes";
import { CompanyRoutes } from "../modules/Company/Company.routes";

const router = Router();

const routes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/customer",
    route: CustomerRoutes,
  },
  {
    path: "/companies",
    route: CompanyRoutes,
  },
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
