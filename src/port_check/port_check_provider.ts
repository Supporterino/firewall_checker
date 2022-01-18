import { ExpectedResult, PortCheck } from '.';
import { inventory_provider, rule_provider } from '..';
import { Group, Host } from '../inventory';
import { ForwardRule, IPRestrictedRule, PortRule, RuleType, TargetedIPRule } from '../rules';
import { logger, Provider, timed } from '../utils';

export class PortCheckProvider implements Provider {
  private __checks!: Array<PortCheck>;
  private __portRuleChecks!: Array<PortCheck>;
  private __forwardRuleChecks!: Array<PortCheck>;
  private __ipRestricedRuleChecks!: Array<PortCheck>;
  private __targetedRuleChecks!: Array<PortCheck>;
  constructor() {
  }

  initArrays() {
    this.__checks = new Array<PortCheck>();
    this.__portRuleChecks  = new Array<PortCheck>();
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
    this.initArrays()
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

    // this.__portRuleChecks = this.deduplicateChecks(this.__portRuleChecks)
    // this.__forwardRuleChecks = this.deduplicateChecks(this.__forwardRuleChecks)
    // this.__ipRestricedRuleChecks = this.deduplicateChecks(this.__ipRestricedRuleChecks)
    // this.__targetedRuleChecks = this.deduplicateChecks(this.__targetedRuleChecks)

    this.__checks = this.__checks.concat(this.__portRuleChecks, this.__forwardRuleChecks, this.__ipRestricedRuleChecks, this.__targetedRuleChecks)
  }

  @timed
  deduplicateChecks(arr: Array<PortCheck>): Array<PortCheck> {
    return arr.filter((value: PortCheck, index: number, self: Array<PortCheck>) => {
      // TODO: Add deduplication
    })
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
