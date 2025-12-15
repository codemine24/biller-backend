import { Router } from "express";
import auth from "../../middlewares/auth";
import { InventoryControllers } from "./Inventory.controllers";
import { InventorySchemas } from "./Inventory.schemas";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../../prisma/generated";

const router = Router();

// Get low stock items (must be before /:id to avoid route conflict)
router.get(
  "/low-stock",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  InventoryControllers.getLowStockItems
);

// Get inventory by store
router.get(
  "/store/:storeId",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  InventoryControllers.getInventoryByStore
);

// Get inventory by product
router.get(
  "/product/:productId",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  InventoryControllers.getInventoryByProduct
);

// Create inventory record
router.post(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN),
  payloadValidator(InventorySchemas.createInventory),
  InventoryControllers.createInventory
);

// Get all inventory
router.get(
  "/",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  InventoryControllers.getInventory
);

// Get single inventory record
router.get(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SALESMAN),
  InventoryControllers.getInventoryById
);

// Update inventory
router.patch(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN),
  payloadValidator(InventorySchemas.updateInventory),
  InventoryControllers.updateInventory
);

// Adjust inventory
router.patch(
  "/:id/adjust",
  auth(UserRole.OWNER, UserRole.ADMIN, UserRole.BRANCH_MANAGER),
  payloadValidator(InventorySchemas.adjustInventory),
  InventoryControllers.adjustInventory
);

// Delete inventory
router.delete(
  "/:id",
  auth(UserRole.OWNER, UserRole.ADMIN),
  InventoryControllers.deleteInventory
);

export const InventoryRoutes = router;
