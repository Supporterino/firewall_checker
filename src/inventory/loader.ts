import { join } from 'path';
import { Group, Host } from '.';
import { logger, YamlLoader } from '../utils';

export class InventoryLoader {
  private __invPath: string;
  private __inventory!: any;
  private __yamlLoader: YamlLoader;

  constructor() {
    logger.info('Creating InventoryLoader');
    this.__invPath = join(process.cwd(), 'data/ansible/inventories/production/group_vars/ssh_boxes/vars');
    this.__yamlLoader = new YamlLoader();
  }

  loadInventory() {
    this.__inventory = this.__yamlLoader.loadYamlFile(this.__invPath);
  }

  loadGroups(): Array<Group> {
    if (!this.__inventory) this.loadInventory();
    const groupNames = (
      this.__inventory['knuddels_ansible_groups'] +
      ',' +
      this.__inventory['knuddels_server_iacs'] +
      ',' +
      this.__inventory['knuddels_server_hosters'] +
      ',' +
      this.__inventory['knuddels_service_groups']
    ).split(',');
    const output = new Array<Group>();
    for (const name of groupNames) {
      if (output.map((e) => e._name).indexOf(name) == -1) output.push(new Group(name));
    }

    return output;
  }

  loadHosts(groups: Array<Group>): Array<Host> {
    if (!this.__inventory) this.loadInventory();
    const output = new Array<Host>();
    for (const entry of this.__inventory['knuddels_servers']) {
      logger.debug(entry);
      const host = new Host(entry.hostname, entry.ip);
      output.push(host);
      groups
        .find((element: Group) => {
          return element._name == entry.prometheus_labels.iac;
        })
        ?.addHost(host);
      groups
        .find((element: Group) => {
          return element._name == entry.prometheus_labels.hoster;
        })
        ?.addHost(host);
      if (entry.prometheus_labels['service_group'])
        groups
          .find((element: Group) => {
            return element._name == entry.prometheus_labels.service_group;
          })
          ?.addHost(host);
      if (entry['ansible_groups'])
        entry.ansible_groups.forEach((group: string) => {
          groups
            .find((element: Group) => {
              return element._name == group;
            })
            ?.addHost(host);
        });
    }
    return output;
  }
}
