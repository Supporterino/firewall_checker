import { InventoryProvider } from './inventory';
import { logger } from './utils';

export const inventory_provider = new InventoryProvider();
inventory_provider.updateInventory();

logger.debug(inventory_provider.groups.map((e) => e._name));
