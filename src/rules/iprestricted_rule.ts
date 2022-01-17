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
  constructor(port: number, proto: Protocol, comment: string, type: RuleType, target: string, allowedIPs: Array<string> | string) {
    super(port, proto, comment, type, target);
    if (allowedIPs instanceof String) this.__allowedIPs = this.loadTargetsFromInventory(<string>allowedIPs);
    else this.__allowedIPs = <Array<string>>allowedIPs;
  }

  loadTargetsFromInventory(key: string): Array<string> {
    const loader = new YamlLoader();
    const data = loader.loadYamlFileWithKey(
      join(process.cwd(), 'data/ansible/inventories/production/group_vars/all/vars'),
      key.substring(2, -2).trim()
    );
    return data;
  }
}
