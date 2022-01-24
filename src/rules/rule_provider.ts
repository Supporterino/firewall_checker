import { Rule, RuleLoader } from '.';
import { inventory_provider } from '..';
import { logger, Provider, timed } from '../utils';

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

  stats(): string {
    return `
    RuleProvider Stats:
    \tNumber of rules: ${this.__rules.length}
    \tNumber of group rules: ${this.__groupRules.length}
    \tNumber of host rules: ${this.__hostRules.length}
    `;
  }

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

  private loadHostRule() {
    logger.info('Loading host firewall rules');
    inventory_provider.getHostNames().forEach((hostName: string) => {
      const data = this.__loader.getRulesForHost(hostName);
      this.__hostRules = this.__hostRules.concat(data);
      this.__rules = this.__rules.concat(data);
    });
  }

  private loadGroupRules() {
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
