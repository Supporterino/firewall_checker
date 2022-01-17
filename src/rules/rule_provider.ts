import { Rule, RuleLoader } from '.';
import { logger, Provider } from '../utils';

export class RuleProvider implements Provider {
  private __rules: Array<Rule>;
  private __globalRules: Array<Rule>;
  private __loader: RuleLoader;

  constructor() {
    logger.info('Creating RuleProvider');
    this.__rules = new Array<Rule>();
    this.__globalRules = new Array<Rule>();
    this.__loader = new RuleLoader();
  }

  update(): void {
    this.loadGlobalRules();
  }

  loadGlobalRules() {
    this.__globalRules = this.__loader.getRulesForGroup('all');
    logger.debug(this.__globalRules)
  }

  public get rules(): Array<Rule> {
    return this.__rules;
  }
}
