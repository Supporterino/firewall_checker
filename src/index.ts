import { InventoryProvider } from './inventory';
import { MetricsProvider } from './metrics';
import { Executor, PortCheckProvider } from './port_check';
import { RuleProvider } from './rules/rule_provider';
import { Runtime } from './runtime';
import { GitUpdater } from './utils';

export const git_updater = new GitUpdater();
export const inventory_provider = new InventoryProvider();
export const rule_provider = new RuleProvider();
export const port_check_provider = new PortCheckProvider();
export const metrics_provider = new MetricsProvider();
export const executor = new Executor();
const runtime = new Runtime();

runtime.start();
