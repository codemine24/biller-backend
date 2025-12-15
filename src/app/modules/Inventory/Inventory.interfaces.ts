import z from "zod";
import { InventorySchemas } from "./Inventory.schemas";

export type CreateInventoryPayload = z.infer<typeof InventorySchemas.createInventory>['body'];

export type UpdateInventoryPayload = z.infer<typeof InventorySchemas.updateInventory>['body'];

export type AdjustInventoryPayload = z.infer<typeof InventorySchemas.adjustInventory>['body'];
