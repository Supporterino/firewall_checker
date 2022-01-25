import { ExpectedResult, PortCheck } from '.';
import { inventory_provider, rule_provider } from '..';
import { Group, Host } from '../inventory';
import { ForwardRule, IPRestrictedRule, PortRule, RuleType, TargetedIPRule } from '../rules';
import { logger, Provider, timed } from '../utils';

/**
 * This class provides the `PortCheck`'s generated from the rules of the `RuleProvider`
 */
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

  /**
   * Initializes / Clears the arrays which hold the `PortCheck`'s
   */
  private initArrays(): void {
    logger.debug('Initializing arrays');
    this.__checks = new Array<PortCheck>();
    this.__portRuleChecks = new Array<PortCheck>();
    this.__forwardRuleChecks = new Array<PortCheck>();
    this.__ipRestricedRuleChecks = new Array<PortCheck>();
    this.__targetedRuleChecks = new Array<PortCheck>();
  }

  /**
   * Update the `PortChecks` by rebuilding them from the rules
   */
  @timed
  update(): void {
    logger.info('Updating port checks.');
    this.generatePortChecks();
    logger.info('Updating port checks finished.');
  }

  /**
   * Print the stats about the `PortCheckProvider` which includes the total number of checks and the number of checks by rule type
   * @returns The string with the stats
   */
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

  /**
   * This function builds the `PortChecks` for each rule type and the concatenates them and deduplicates them.
   */
  private generatePortChecks() {
    this.initArrays();
    logger.debug(`Creating PortChecks for all rules expect negative PortRule checks`);
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

    logger.debug('Building the negative PortChecks for the PortRules');
    for (const rule of rule_provider.rules) {
      switch (rule.constructor.name) {
        case PortRule.name:
          this.__portRuleChecks = this.__portRuleChecks.concat(this.generateNegativeJobsFromPortRule(rule));
          break;
        default:
          break;
      }
    }

    logger.debug('Deduplicating the checks.');
    this.__checks = this.__checks.concat(
      this.__portRuleChecks,
      this.__forwardRuleChecks,
      this.__ipRestricedRuleChecks,
      this.__targetedRuleChecks
    );

    this.__checks = this.deduplicateChecks(this.__checks);
  }

  /**
   * This function deduplicated an array of `PortCheck`s by checking if there are duplicates. If duplicates are found
   * it is determined which rule has the highest priority and added to the `output` array
   * @param arr The array of `PortCheck`s to deduplicate
   * @returns The cleaned array of `PortCheck`s
   */
  @timed
  private deduplicateChecks(arr: Array<PortCheck>): Array<PortCheck> {
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

  /**
   * This function determines if a new `PortCheck` should be added to the array
   * @param to_add the new `PortCheck`
   * @param arr an array of existing `PortCheck`s
   * @returns boolean if the check should be added
   */
  private shouldAdd(to_add: PortCheck, arr: Array<PortCheck>): boolean {
    const identicals = this.findIdentical(to_add, arr);
    if (identicals.length === 0) return true;
    return false;
  }

  /**
   * This function finds the `PortCheck` with the highest priority
   * @param checks an array of identical `PortCheck`s
   * @returns the `PortCheck` with the highest priority
   */
  private determinWinningRule(checks: Array<PortCheck>): PortCheck {
    const unique = this.isEqualChecks(checks);
    if (unique) return unique;
    const hierachieWinner = this.isHierachie(checks);
    if (hierachieWinner) return hierachieWinner;
    const ownRuleWinner = this.isOwnRule(checks);
    if (ownRuleWinner) return ownRuleWinner;
    logger.warn(checks);
    throw new Error(`Can't deduplicate`);
  }

  /**
   * Check if an array of `PortCheck`s is elementary equal
   * @param checks array of `PortCheck`s to test
   * @returns the unique `PortCheck` or `undefined` if they differ
   */
  private isEqualChecks(checks: Array<PortCheck>): PortCheck | undefined {
    const first = checks[0];
    if (checks.every((val) => val._expected === first._expected && val._host === first._host && val._port === first._port)) return first;
    return undefined;
  }

  /**
   * Check if an array of `PortCheck`s has a rule matching the targeted host or group
   * @param checks array of `PortCheck`s to test
   * @returns the `PortCheck` matching the target of the rule or `undefined` if they differ
   */
  private isOwnRule(checks: Array<PortCheck>): PortCheck | undefined {
    for (const check of checks) {
      if (check._rule.type === RuleType.HOST && check._host == inventory_provider.findHostByName(check._rule.target).ip) return check;
      if (check._rule.type === RuleType.GROUP && inventory_provider.getGroupByName(check._rule.target).isHostPartOfGroup(check._host))
        return check;
    }
    return undefined;
  }

  /**
   * Check if an array of `PortCheck`s has an check with a higher scope
   * @param checks array of `PortCheck`s to test
   * @returns the `PortCheck` with the highest scope which is unique or `undefined` if they differ
   */
  private isHierachie(checks: Array<PortCheck>): PortCheck | undefined {
    const host_rules = checks.filter((val) => val._rule.type === RuleType.HOST);
    if (host_rules.length === 1) return host_rules[0];
    if (host_rules.length > 1) return undefined;
    const group_rules = checks.filter((val) => val._rule.type === RuleType.GROUP);
    if (group_rules.length === 1) return group_rules[0];
    return undefined;
  }

  /**
   * Finds identical `PortCheck`s (`item` parameter) in the array (`arr` parameter). Identical in this scope means same target and port
   * @param item the `PortCheck` to find identicals from
   * @param arr the array to search in
   * @returns an array with all identicals
   */
  private findIdentical(item: PortCheck, arr: Array<PortCheck>): Array<PortCheck> {
    return arr.filter((val) => {
      return item._host == val._host && item._port == val._port && item !== val;
    });
  }

  /**
   * Generates the `PortCheck`s from an `IPRestrictedRule`
   * @param rule the rule from which to generate the `PortCheck`s
   * @returns an array of `PortCheck`s
   */
  private generateJobsFromIPRestricedRule(rule: IPRestrictedRule): Array<PortCheck> {
    const output = new Array<PortCheck>();

    inventory_provider.hosts.forEach((host: Host) => {
      output.push(new PortCheck(host.ip, rule.port, ExpectedResult.CLOSED, rule));
    });
    return output;
  }

  /**
   * Generates the `PortCheck`s from an `TargetedIPRule`
   * @param rule the rule from which to generate the `PortCheck`s
   * @returns an array of `PortCheck`s
   */
  private generateJobsFromTargetedRule(rule: TargetedIPRule): Array<PortCheck> {
    const output = new Array<PortCheck>();

    inventory_provider.hosts.forEach((host: Host) => {
      output.push(new PortCheck(host.ip, rule.port, ExpectedResult.CLOSED, rule));
    });
    return output;
  }

  /**
   * Generates the `PortCheck`s from an `PortRule`. Only includes the positive checks which means `ExpectedResult` is open.
   * @param rule the rule from which to generate the `PortCheck`s
   * @returns an array of `PortCheck`s
   */
  private generateJobsFromPortRule(rule: PortRule): Array<PortCheck> {
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

  /**
   * Generates the `PortCheck`s from an `ForwardRule`
   * @param rule the rule from which to generate the `PortCheck`s
   * @returns an array of `PortCheck`s
   */
  private generateJobsFromForwardRule(rule: ForwardRule): Array<PortCheck> {
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

  /**
   * Generates the `PortCheck`s from an `PortRule`. Only negative rules if the rule ins't a range rule.
   * @param rule the rule from which to generate the `PortCheck`s
   * @returns an array of `PortCheck`s
   */
  private generateNegativeJobsFromPortRule(rule: PortRule): Array<PortCheck> {
    const output = new Array<PortCheck>();
    switch (rule.type) {
      case RuleType.HOST:
        inventory_provider.hosts.forEach((host: Host) => {
          if (host.name !== rule.target && !rule.isRangeRule) {
            const check = new PortCheck(host.ip, rule.port, ExpectedResult.CLOSED, rule);
            if (this.shouldAdd(check, this.__portRuleChecks)) output.push(check);
          }
        });
        break;
      case RuleType.GROUP:
        inventory_provider.groups.forEach((group: Group) => {
          group._hosts.forEach((host: Host) => {
            if (group._name !== rule.target && !rule.isRangeRule) {
              const check = new PortCheck(host.ip, rule.port, ExpectedResult.CLOSED, rule);
              if (this.shouldAdd(check, this.__portRuleChecks)) output.push(check);
            }
          });
        });
        break;
      default:
        break;
    }
    return output;
  }
}
