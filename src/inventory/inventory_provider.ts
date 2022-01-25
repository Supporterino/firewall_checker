import { Group, Host, InventoryLoader } from '.';
import { logger, Provider, timed } from '../utils';

/**
 * This class provides the `Group`s and `Host`s from the ansible inventory
 */
export class InventoryProvider implements Provider {
  private __loader: InventoryLoader;
  private __groups: Array<Group>;
  private __hosts: Array<Host>;

  constructor() {
    logger.info('Creating Inventory Provider');
    this.__loader = new InventoryLoader();
    this.__groups = new Array<Group>();
    this.__hosts = new Array<Host>();
  }

  /**
   * Prints the number of `Host`s and `Group`s in the inventory
   * @returns a string with the stats
   */
  stats(): string {
    return `
    InventoryProvider Stats:
    \tNumber of hosts: ${this.__hosts.length}
    \tNumber of groups: ${this.__groups.length}
    `;
  }

  /**
   * Update the inventory from the ansible yaml files
   */
  @timed
  update(): void {
    logger.info('Updating ansible inventory.');
    this.__loader.loadInventory();
    this.loadGroups();
    this.loadHosts();
    logger.info('Updating ansible inventory finished.');
  }

  /**
   * Get a single `Group` by name
   * @param name the name of the `Group`
   * @returns the `Group` object
   */
  getGroupByName(name: string): Group {
    return this.__groups.find((element: Group) => {
      return element._name == name;
    })!;
  }

  /**
   * Return the names of all `Groups`s
   * @returns array with all names as string
   */
  getGroupNames(): Array<string> {
    return this.__groups.map((e) => e._name);
  }

  /**
   * Return the names of all `Host`s
   * @returns array with all names as string
   */
  getHostNames(): Array<string> {
    return this.__hosts.map((e) => e.name);
  }

  /**
   * Finds a `Host` by its `name` in the inventory
   * @param name the name of the host
   * @returns the `Host` object
   */
  findHostByName(name: string): Host {
    return this.__hosts.find((e) => e.name === name)!;
  }

  /**
   * Update the groups via the `InventoryLoader`
   */
  private loadGroups(): void {
    this.__groups = this.__loader.loadGroups();
  }

  /**
   * Update the hosts via the `InventoryLoader`
   */
  private loadHosts(): void {
    this.__hosts = this.__loader.loadHosts(this.__groups);
  }

  public get hosts(): Array<Host> {
    return this.__hosts;
  }

  public get groups(): Array<Group> {
    return this.__groups;
  }
}
