import { InventoryProvider } from './inventory';
import { RuleProvider } from './rules/rule_provider';
import { logger } from './utils';

export const inventory_provider = new InventoryProvider();
export const rule_provider = new RuleProvider();

inventory_provider.update();
rule_provider.update();

// logger.debug(inventory_provider.groups.map((e) => e._name));
