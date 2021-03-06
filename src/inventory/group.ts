import { Host } from '.';
import { logger } from '../utils';

export class Group {
  private __name: string;
  private __hosts: Array<Host>;

  constructor(name: string) {
    this.__name = name;
    this.__hosts = new Array<Host>();
    logger.silly(`Initialized Host:`, this);
  }

  public get _name(): string {
    return this.__name;
  }

  public get _hosts(): Array<Host> {
    return this.__hosts;
  }
  public set _hosts(value: Array<Host>) {
    this.__hosts = value;
  }

  /**
   * Checks if a `Host` is part of a `Group`
   * @param host The `Host` to check
   * @returns boolean indicating if the `Host` is part of the `Group`
   */
  isHostPartOfGroup(host: string): boolean {
    if (this.__hosts.find((val) => val.ip === host)) return true;
    return false;
  }

  /**
   * Append a `Host` to the hosts of a group
   * @param host The `Host` to add
   */
  addHost(host: Host): void {
    logger.debug(`Adding Host (${host.name}) to group (${this.__name})`);
    this.__hosts.push(host);
  }
}
