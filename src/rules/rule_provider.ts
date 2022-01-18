import { Rule, RuleLoader } from '.';
import { inventory_provider } from '..';
import { logger, Provider } from '../utils';

export class RuleProvider implements Provider {
  private __rules: Array<Rule>;
  private __groupRules: Array<Rule>;
  private __loader: RuleLoader;

  constructor() {
    logger.info('Creating RuleProvider');
    this.__rules = new Array<Rule>();
    this.__groupRules = new Array<Rule>();
    this.__loader = new RuleLoader();
  }

  update(): void {
    this.loadGroupRules();
  }

  loadGroupRules() {
    inventory_provider.getGroupNames().forEach((groupName: string) => {
      const data = this.__loader.getRulesForGroup(groupName);
      this.__groupRules = this.__groupRules.concat(data);
      this.__rules = this.__rules.concat(data);
    });

    logger.debug(this.__rules.length);
  }

  public get rules(): Array<Rule> {
    return this.__rules;
  }
}
