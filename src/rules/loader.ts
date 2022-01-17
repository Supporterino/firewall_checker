import { join } from 'path';
import { getProtocol, PortRule, Rule, RuleType } from '.';
import { logger, YamlLoader } from '../utils';

export class RuleLoader {
  private __loader: YamlLoader;

  constructor() {
    logger.info('Creating RuleLoader');
    this.__loader = new YamlLoader();
  }

  getRulesForGroup(name: string): Array<Rule> {
    let output = new Array<Rule>();

    const group_inventory = <any>this.__loader.loadYamlFile(join(process.cwd(), 'data/ansible/inventories/production/group_vars', name, 'vars'));

    if (name === 'all') {
        output = output.concat(this.buildPortRules(group_inventory.fw_global_allow_port, RuleType.GLOBAL, name))
    }
    return output;
  }

  buildPortRules(data: Array<any>, type: RuleType, target: string): Array<PortRule> {
      const output = new Array<PortRule>();
      for (const entry of data) {
          output.push(new PortRule(entry.to_port, getProtocol(entry.proto), entry.comment, type, target))
      }  
      return output
  }
}
