import { ExpectedResult, PortCheck } from '.';
import { inventory_provider, rule_provider } from '..';
import { Group, Host } from '../inventory';
import { ForwardRule, IPRestrictedRule, PortRule, RuleType, TargetedIPRule } from '../rules';
import { logger, Provider, timed } from '../utils';

export class PortCheckProvider implements Provider {
  private __checks!: Array<PortCheck>;
  public get checks(): Array<PortCheck> {
    return this.__checks;
  }
  public set checks(value: Array<PortCheck>) {
    this.__checks = value;
  }
  private __portRuleChecks!: Array<PortCheck>;
  private __forwardRuleChecks!: Array<PortCheck>;
  private __ipRestricedRuleChecks!: Array<PortCheck>;
  private __targetedRuleChecks!: Array<PortCheck>;
  constructor() {}

  initArrays() {
    this.__checks = new Array<PortCheck>();
    this.__portRuleChecks = new Array<PortCheck>();
    this.__forwardRuleChecks = new Array<PortCheck>();
    this.__ipRestricedRuleChecks = new Array<PortCheck>();
    this.__targetedRuleChecks = new Array<PortCheck>();
  }

  @timed
  update(): void {
    logger.info('Updating port checks.');
    this.generatePortChecks();
    logger.info('Updating port checks finished.');
  }

  stats(): string {
    return `
    PortCheckProvider stats:
    \tNumber of checks: ${this.__checks.length}
    \tNumber of checks based on PortRule: ${this.__portRuleChecks.length}
    \tNumber of checks based on ForwardRule: ${this.__forwardRuleChecks.length}
    \tNumber of checks based on IPRestricedRule: ${this.__ipRestricedRuleChecks.length}
    \tNumber of checks based on TargetedIPRule: ${this.__targetedRuleChecks.length}
    `;
  }

  generatePortChecks() {
    this.initArrays();
    for (const rule of rule_provider.rules) {
      switch (rule.constructor.name) {
        case PortRule.name:
          this.__portRuleChecks = this.__portRuleChecks.concat(this.generateJobsFromPortRule(rule));
          break;
        case ForwardRule.name:
          this.__forwardRuleChecks = this.__forwardRuleChecks.concat(this.generateJobsFromForwardRule(<ForwardRule>rule));
          break;
        case IPRestrictedRule.name:
          this.__ipRestricedRuleChecks = this.__ipRestricedRuleChecks.concat(this.generateJobsFromIPRestricedRule(<IPRestrictedRule>rule));
          break;
        case TargetedIPRule.name:
          this.__targetedRuleChecks = this.__targetedRuleChecks.concat(this.generateJobsFromTargetedRule(<TargetedIPRule>rule));
          break;
        default:
          break;
      }
    }

    this.__checks = this.__checks.concat(
      this.__portRuleChecks,
      this.__forwardRuleChecks,
      this.__ipRestricedRuleChecks,
      this.__targetedRuleChecks
    );

    this.__checks = this.deduplicateChecks(this.__checks);

    this.__checks.forEach((val) => {
      const dups = this.findIdentical(val, this.__checks);
      if (dups.length > 0) {
        dups.push(val);
        logger.debug(dups);
      }
    });
  }

  @timed
  deduplicateChecks(arr: Array<PortCheck>): Array<PortCheck> {
    const output = new Array<PortCheck>();
    arr.forEach((check) => {
      const duplicates = this.findIdentical(check, arr);
      if (duplicates.length > 0) {
        duplicates.push(check);
        const to_add = this.determinWinningRule(duplicates);
        if (this.shouldAdd(to_add, output)) output.push(to_add);
      } else {
        output.push(check);
      }
    });

    return output;
  }

  shouldAdd(to_add: PortCheck, arr: Array<PortCheck>): boolean {
    const identicals = this.findIdentical(to_add, arr);
    if (identicals.length === 0) return true;
    return false;
  }

  determinWinningRule(checks: Array<PortCheck>): PortCheck {
    const unique = this.isEqualChecks(checks);
    if (unique) return unique;
    const hierachieWinner = this.isHierachie(checks);
    if (hierachieWinner) return hierachieWinner;
    const ownRuleWinner = this.isOwnRule(checks);
    if (ownRuleWinner) return ownRuleWinner;
    logger.warn(checks);
    throw new Error(`Can't deduplicate`);
  }

  isEqualChecks(checks: Array<PortCheck>): PortCheck | undefined {
    const first = checks[0];
    if (checks.every((val) => val._expected === first._expected && val._host === first._host && val._port === first._port)) return first;
    return undefined;
  }

  isOwnRule(checks: Array<PortCheck>): PortCheck | undefined {
    for (const check of checks) {
      if (check._rule.type === RuleType.HOST && check._host == inventory_provider.findHostByName(check._rule.target).ip) return check;
      if (check._rule.type === RuleType.GROUP && inventory_provider.getGroupByName(check._rule.target).isHostPartOfGroup(check._host))
        return check;
    }
    return undefined;
  }

  isHierachie(checks: Array<PortCheck>): PortCheck | undefined {
    const host_rules = checks.filter((val) => val._rule.type === RuleType.HOST);
    if (host_rules.length === 1) return host_rules[0];
    if (host_rules.length > 1) return undefined;
    const group_rules = checks.filter((val) => val._rule.type === RuleType.GROUP);
    if (group_rules.length === 1) return group_rules[0];
    return undefined;
  }

  findIdentical(item: PortCheck, arr: Array<PortCheck>): Array<PortCheck> {
    return arr.filter((val) => {
      return item._host == val._host && item._port == val._port && item !== val;
    });
  }

  generateJobsFromIPRestricedRule(rule: IPRestrictedRule): Array<PortCheck> {
    const output = new Array<PortCheck>();

    inventory_provider.hosts.forEach((host: Host) => {
      output.push(new PortCheck(host.ip, rule.port, ExpectedResult.CLOSED, rule));
    });
    return output;
  }

  generateJobsFromTargetedRule(rule: TargetedIPRule): Array<PortCheck> {
    const output = new Array<PortCheck>();

    inventory_provider.hosts.forEach((host: Host) => {
      output.push(new PortCheck(host.ip, rule.port, ExpectedResult.CLOSED, rule));
    });
    return output;
  }

  generateJobsFromPortRule(rule: PortRule): Array<PortCheck> {
    const output = new Array<PortCheck>();
    switch (rule.type) {
      case RuleType.HOST:
        inventory_provider.hosts.forEach((host: Host) => {
          if (host.name === rule.target) output.push(new PortCheck(host.ip, rule.port, ExpectedResult.OPEN, rule));
        });
        break;
      case RuleType.GLOBAL:
        inventory_provider.hosts.forEach((host: Host) => {
          output.push(new PortCheck(host.ip, rule.port, ExpectedResult.OPEN, rule));
        });
        break;
      case RuleType.GROUP:
        inventory_provider.groups.forEach((group: Group) => {
          group._hosts.forEach((host: Host) => {
            if (group._name === rule.target) output.push(new PortCheck(host.ip, rule.port, ExpectedResult.OPEN, rule));
          });
        });
        break;
      default:
        break;
    }
    return output;
  }

  generateJobsFromForwardRule(rule: ForwardRule): Array<PortCheck> {
    const output = new Array<PortCheck>();
    switch (rule.type) {
      case RuleType.HOST:
        inventory_provider.hosts.forEach((host: Host) => {
          if (host.name === rule.target) output.push(new PortCheck(host.ip, rule.port, ExpectedResult.OPEN, rule));
          else output.push(new PortCheck(host.ip, rule.port, ExpectedResult.CLOSED, rule));
        });
        break;
      case RuleType.GLOBAL:
        inventory_provider.hosts.forEach((host: Host) => {
          output.push(new PortCheck(host.ip, rule.port, ExpectedResult.OPEN, rule));
        });
        break;
      case RuleType.GROUP:
        inventory_provider.groups.forEach((group: Group) => {
          group._hosts.forEach((host: Host) => {
            if (group._name === rule.target) output.push(new PortCheck(host.ip, rule.port, ExpectedResult.OPEN, rule));
            else output.push(new PortCheck(host.ip, rule.port, ExpectedResult.CLOSED, rule));
          });
        });
        break;
      default:
        break;
    }
    return output;
  }
}
