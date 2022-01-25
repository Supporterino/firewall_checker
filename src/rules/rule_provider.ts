import { Rule, RuleLoader } from '.';
import { inventory_provider } from '..';
import { logger, Provider, timed } from '../utils';

/**
 * This class provides the firewall rules from a given inventory
 */
export class RuleProvider implements Provider {
  private __rules: Array<Rule>;
  private __groupRules: Array<Rule>;
  private __hostRules: Array<Rule>;
  private __loader: RuleLoader;

  constructor() {
    logger.info('Creating RuleProvider');
    this.__rules = new Array<Rule>();
    this.__groupRules = new Array<Rule>();
    this.__hostRules = new Array<Rule>();
    this.__loader = new RuleLoader();
  }

  /**
   * Returns the number of rules for hosts, groups and total
   * @returns The string representing the stats
   */
  stats(): string {
    return `
    RuleProvider Stats:
    \tNumber of rules: ${this.__rules.length}
    \tNumber of group rules: ${this.__groupRules.length}
    \tNumber of host rules: ${this.__hostRules.length}
    `;
  }

  /**
   * Triggers the reload of a rules.
   */
  @timed
  update(): void {
    logger.info('Updating firewall rules.');
    this.__rules = new Array<Rule>();
    this.__groupRules = new Array<Rule>();
    this.__hostRules = new Array<Rule>();
    this.loadGroupRules();
    this.loadHostRule();
    logger.info('Updating firewall rules finished.');
  }

  /**
   * Load the hosts from the `InventoryProvider` and create the rules for each host with the `RuleLoader`
   */
  private loadHostRule(): void {
    logger.info('Loading host firewall rules');
    inventory_provider.getHostNames().forEach((hostName: string) => {
      const data = this.__loader.getRulesForHost(hostName);
      this.__hostRules = this.__hostRules.concat(data);
      this.__rules = this.__rules.concat(data);
    });
  }

  /**
   * Load the groups from the `InventoryProvider` and create the rules for each group with the `RuleLoader`
   */
  private loadGroupRules(): void {
    logger.info('Loading group firewall rules');
    inventory_provider.getGroupNames().forEach((groupName: string) => {
      const data = this.__loader.getRulesForGroup(groupName);
      this.__groupRules = this.__groupRules.concat(data);
      this.__rules = this.__rules.concat(data);
    });
  }

  public get rules(): Array<Rule> {
    return this.__rules;
  }
}
