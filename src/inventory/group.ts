import { Host } from '.';

export class Group {
  private __name: string;
  private __hosts: Array<Host>;

  constructor(name: string) {
    this.__name = name;
    this.__hosts = new Array<Host>();
  }

  public get _name(): string {
    return this.__name;
  }

  addHost(host: Host): void {
    this.__hosts.push(host);
  }
}
