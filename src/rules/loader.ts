import { join } from 'path';
import { ForwardRule, getProtocol, IPRestrictedRule, PortRule, Protocol, Rule, RuleType, TargetedIPRule } from '.';
import { logger, YamlLoader } from '../utils';

export class RuleLoader {
  private __loader: YamlLoader;

  constructor() {
    logger.info('Creating RuleLoader');
    this.__loader = new YamlLoader();
  }

  getRulesForGroup(name: string): Array<Rule> {
    logger.info(`Trying to load rules for group: ${name}`);
    let output = new Array<Rule>();
    const path = join(process.cwd(), 'data/ansible/inventories/production/group_vars', name, 'vars');

    logger.debug(`Checking if group inventory at path (${path}) exists`);
    if (!this.__loader.isLoadable(path)) return output;

    logger.debug(`Loading group inventory of group ${name}`);
    const group_inventory = <any>this.__loader.loadYamlFile(path);

    logger.debug(`Building rules for group ${name}`);
    if (name === 'all') {
      output = output.concat(this.buildPortRules(group_inventory.fw_global_allow_port, RuleType.GLOBAL, name));
      output = output.concat(this.buildIPRestrictedRules(group_inventory.fw_global_from_ip_to_port_multi, RuleType.GLOBAL, name));
      output = output.concat(this.buildTargetedIPRules(group_inventory.fw_global_to_ip_to_port, RuleType.GLOBAL, name));
      output = output.concat(this.buildForwardRules(group_inventory.fw_global_forward_port, RuleType.GLOBAL, name));
    } else {
      output = output.concat(this.buildPortRules(group_inventory.fw_group_allow_port, RuleType.GROUP, name));
      output = output.concat(this.buildIPRestrictedRules(group_inventory.fw_group_from_ip_to_port_multi, RuleType.GROUP, name));
      output = output.concat(this.buildTargetedIPRules(group_inventory.fw_group_to_ip_to_port, RuleType.GROUP, name));
      output = output.concat(this.buildForwardRules(group_inventory.fw_group_forward_port, RuleType.GROUP, name));
    }

    return output;
  }

  getRulesForHost(name: string): Array<Rule> {
    logger.info(`Trying to load rules for host: ${name}`);
    let output = new Array<Rule>();
    const path = join(process.cwd(), 'data/ansible/inventories/production/host_vars', name, 'vars');

    logger.debug(`Checking if host inventory at path (${path}) exists`);
    if (!this.__loader.isLoadable(path)) return output;

    logger.debug(`Loading host inventory of ${name}`);
    const group_inventory = <any>this.__loader.loadYamlFile(path);

    logger.debug(`Building rules for ${name}`);
    output = output.concat(this.buildPortRules(group_inventory.fw_host_allow_port, RuleType.HOST, name));
    output = output.concat(this.buildIPRestrictedRules(group_inventory.fw_host_from_ip_to_port_multi, RuleType.HOST, name));
    output = output.concat(this.buildTargetedIPRules(group_inventory.fw_host_to_ip_to_port, RuleType.HOST, name));
    output = output.concat(this.buildForwardRules(group_inventory.fw_host_forward_port, RuleType.HOST, name));

    return output;
  }

  private buildPortRules(data: Array<any>, type: RuleType, target: string): Array<PortRule> {
    const output = new Array<PortRule>();
    if (!data) return output;
    for (const entry of data) {
      if (typeof entry.to_port === 'number')
        output.push(new PortRule(entry.to_port, getProtocol(entry.proto), entry.comment, type, target));
      else if (getProtocol(entry.proto) === Protocol.TCP) {
        const start = entry.to_port.split(':')[0];
        const end = entry.to_port.split(':')[1];
        for (let index: number = start; index <= end; index++) {
          output.push(new PortRule(index, getProtocol(entry.proto), entry.comment, type, target));
        }
      }
    }
    return output;
  }

  private buildIPRestrictedRules(data: Array<any>, type: RuleType, target: string): Array<IPRestrictedRule> {
    const output = new Array<IPRestrictedRule>();
    if (!data) return output;
    for (const entry of data) {
      if (typeof entry.to_port === 'number')
        output.push(new IPRestrictedRule(entry.to_port, getProtocol(entry.proto), entry.comment, type, target, entry.ips));
      else if (getProtocol(entry.proto) === Protocol.TCP) {
        const start = entry.to_port.split(':')[0];
        const end = entry.to_port.split(':')[1];
        for (let index: number = start; index <= end; index++) {
          output.push(new IPRestrictedRule(index, getProtocol(entry.proto), entry.comment, type, target, entry.ips));
        }
      }
    }
    return output;
  }

  private buildTargetedIPRules(data: Array<any>, type: RuleType, target: string): Array<TargetedIPRule> {
    const output = new Array<TargetedIPRule>();
    if (!data) return output;
    for (const entry of data) {
      if (typeof entry.to_port === 'number')
        output.push(new TargetedIPRule(entry.to_port, getProtocol(entry.proto), entry.comment, type, target, entry.to_ip));
      else if (getProtocol(entry.proto) === Protocol.TCP) {
        const start = entry.to_port.split(':')[0];
        const end = entry.to_port.split(':')[1];
        for (let index: number = start; index <= end; index++) {
          output.push(new TargetedIPRule(index, getProtocol(entry.proto), entry.comment, type, target, entry.to_ip));
        }
      }
    }
    return output;
  }

  private buildForwardRules(data: Array<any>, type: RuleType, target: string): Array<ForwardRule> {
    const output = new Array<ForwardRule>();
    if (!data) return output;
    for (const entry of data) {
      if (typeof entry.to_port === 'number')
        output.push(new ForwardRule(entry.to_port, getProtocol(entry.proto), entry.comment, type, target, entry.to_ip, entry.to_port));
      else if (getProtocol(entry.proto) === Protocol.TCP) {
        const start = entry.to_port.split(':')[0];
        const end = entry.to_port.split(':')[1];
        for (let index: number = start; index <= end; index++) {
          output.push(new ForwardRule(index, getProtocol(entry.proto), entry.comment, type, target, entry.to_ip, entry.to_port));
        }
      }
    }
    return output;
  }
}
