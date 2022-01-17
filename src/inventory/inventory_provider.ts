import { Group, Host, InventoryLoader } from '.';
import { logger } from '../utils';

export class InventoryProvider {
  private __loader: InventoryLoader;

  private __hosts: Array<Host>;

  constructor() {
    logger.info('Creating Inventory Provider');
    this.__loader = new InventoryLoader();
    this.__groups = new Array<Group>();
    this.__hosts = new Array<Host>();
  }

  updateInventory() {
    this.__loader.loadInventory();
    this.loadGroups();
    this.loadHosts();
  }

  getGroupByName(name: string): Group {
    return this.__groups.find((element: Group) => {
      return element._name == name;
    })!;
  }

  private loadGroups() {
    this.__groups = this.__loader.loadGroups();
  }

  private loadHosts() {
    this.__hosts = this.__loader.loadHosts(this.__groups);
  }

  public get hosts(): Array<Host> {
    return this.__hosts;
  }

  private __groups: Array<Group>;
  public get groups(): Array<Group> {
    return this.__groups;
  }
}
