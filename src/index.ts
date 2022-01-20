import { InventoryProvider } from './inventory';
import { MetricsProvider } from './metrics';
import { Executor, PortCheckProvider } from './port_check';
import { RuleProvider } from './rules/rule_provider';
import { GitUpdater, logger } from './utils';

// const git = new GitUpdater();
// git.cloneRepo()
export const inventory_provider = new InventoryProvider();
export const rule_provider = new RuleProvider();
export const port_check_provider = new PortCheckProvider();
export const metrics_provider = new MetricsProvider();
const executor = new Executor();

inventory_provider.update();
rule_provider.update();
port_check_provider.update();
metrics_provider.update();

executor.run();

// logger.info(inventory_provider.stats());
// logger.info(rule_provider.stats());
// logger.info(port_check_provider.stats());
