import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/Auth.routes";
import { CustomerRoutes } from "../modules/Customer/Customer.routes";
import { CompanyRoutes } from "../modules/Company/Company.routes";
import { VendorRoutes } from "../modules/Vendor/Vendor.routes";
import { ProductRoutes } from "../modules/Product/Product.routes";
import { BrandRoutes } from "../modules/Brand/Brand.routes";
import { CategoryRoutes } from "../modules/Category/Category.routes";
import { StoreRoutes } from "../modules/Store/Store.routes";
import { PurchaseRoutes } from "../modules/Purchase/Purchase.routes";
import { SaleRoutes } from "../modules/Sale/Sale.routes";
import { TransferRoutes } from "../modules/Transfer/Transfer.routes";
import { SaleReturnRoutes } from "../modules/SaleReturn/SaleReturn.routes";
import { PurchaseReturnRoutes } from "../modules/PurchaseReturn/PurchaseReturn.routes";

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
    path: "/company",
    route: CompanyRoutes,
  },
  {
    path: "/vendor",
    route: VendorRoutes,
  },
  {
    path: "/product",
    route: ProductRoutes,
  },
  {
    path: "/brand",
    route: BrandRoutes,
  },
  {
    path: "/category",
    route: CategoryRoutes,
  },
  {
    path: "/store",
    route: StoreRoutes,
  },
  {
    path: "/purchase",
    route: PurchaseRoutes,
  },
  {
    path: "/sale",
    route: SaleRoutes,
  },
  {
    path: "/transfer",
    route: TransferRoutes,
  },
  {
    path: "/sale-return",
    route: SaleReturnRoutes,
  },
  {
    path: "/purchase-return",
    route: PurchaseReturnRoutes,
  },
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
