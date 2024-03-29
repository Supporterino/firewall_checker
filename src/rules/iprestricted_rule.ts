import { join } from 'path';
import { Protocol, Rule, RuleType } from '.';
import { YamlLoader } from '../utils';

export class IPRestrictedRule extends Rule {
  private __allowedIPs: Array<string>;
  public get allowedIPs(): Array<string> {
    return this.__allowedIPs;
  }
  public set allowedIPs(value: Array<string>) {
    this.__allowedIPs = value;
  }
  constructor(
    port: number,
    proto: Protocol,
    comment: string,
    type: RuleType,
    target: string,
    allowedIPs: Array<string> | string,
    isRange: boolean = false
  ) {
    super(port, proto, comment, type, target, isRange);
    if (typeof allowedIPs === 'string') this.__allowedIPs = this.loadTargetsFromInventory(<string>allowedIPs);
    else this.__allowedIPs = <Array<string>>allowedIPs;
  }

  /**
   * Some firewall rules have a shared access list which is stored in a separate yaml key. This function loads
   * those list if the structure is detected in the rule.
   * @param key The yaml key which holds the list of hosts
   * @returns A string array with all allowed ips
   */
  private loadTargetsFromInventory(key: string): Array<string> {
    const loader = new YamlLoader();
    const data = loader.loadYamlFileWithKey(
      join(process.cwd(), 'data/infrastructure/ansible/inventories/production/group_vars/all/vars'),
      key.slice(2, -2).trim()
    );
    return data;
  }
}
