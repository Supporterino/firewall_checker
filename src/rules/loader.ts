import { join } from 'path';
import { ForwardRule, getProtocol, IPRestrictedRule, PortRule, Rule, RuleType, TargetedIPRule } from '.';
import { logger, YamlLoader } from '../utils';

export class RuleLoader {
  private __loader: YamlLoader;

  constructor() {
    logger.info('Creating RuleLoader');
    this.__loader = new YamlLoader();
  }

  getRulesForGroup(name: string): Array<Rule> {
    let output = new Array<Rule>();

    const group_inventory = <any>(
      this.__loader.loadYamlFile(join(process.cwd(), 'data/ansible/inventories/production/group_vars', name, 'vars'))
    );

    if (name === 'all') {
      output = output.concat(this.buildPortRules(group_inventory.fw_global_allow_port, RuleType.GLOBAL, name));
      output = output.concat(this.buildIPRestrictedRules(group_inventory.fw_global_from_ip_to_port_multi, RuleType.GLOBAL, name));
      output = output.concat(this.buildTargetedIPRules(group_inventory.fw_global_to_ip_to_port, RuleType.GLOBAL, name));
      output = output.concat(this.buildForwardRules(group_inventory.fw_global_forward_port, RuleType.GLOBAL, name));
    } else {
      output = output.concat(this.buildPortRules(group_inventory.fw_global_allow_port, RuleType.GROUP, name));
      output = output.concat(this.buildIPRestrictedRules(group_inventory.fw_global_from_ip_to_port_multi, RuleType.GROUP, name));
      output = output.concat(this.buildTargetedIPRules(group_inventory.fw_global_to_ip_to_port, RuleType.GROUP, name));
      output = output.concat(this.buildForwardRules(group_inventory.fw_global_forward_port, RuleType.GROUP, name));
    }

    return output;
  }

  private buildPortRules(data: Array<any>, type: RuleType, target: string): Array<PortRule> {
    const output = new Array<PortRule>();
    if (!data) return output;
    for (const entry of data) {
      output.push(new PortRule(entry.to_port, getProtocol(entry.proto), entry.comment, type, target));
    }
    return output;
  }

  private buildIPRestrictedRules(data: Array<any>, type: RuleType, target: string): Array<IPRestrictedRule> {
    const output = new Array<IPRestrictedRule>();
    if (!data) return output;
    for (const entry of data) {
      output.push(new IPRestrictedRule(entry.to_port, getProtocol(entry.proto), entry.comment, type, target, entry.ips));
    }
    return output;
  }

  private buildTargetedIPRules(data: Array<any>, type: RuleType, target: string): Array<TargetedIPRule> {
    const output = new Array<TargetedIPRule>();
    if (!data) return output;
    for (const entry of data) {
      output.push(new TargetedIPRule(entry.to_port, getProtocol(entry.proto), entry.comment, type, target, entry.to_ip));
    }
    return output;
  }

  private buildForwardRules(data: Array<any>, type: RuleType, target: string): Array<ForwardRule> {
    const output = new Array<ForwardRule>();
    if (!data) return output;
    for (const entry of data) {
      output.push(new ForwardRule(entry.to_port, getProtocol(entry.proto), entry.comment, type, target, entry.to_ip, entry.to_port));
    }
    return output;
  }
}
