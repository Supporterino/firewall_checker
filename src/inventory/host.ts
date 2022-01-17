export class Host {
  private __name: string;
  private __ip: string;

  constructor(name: string, ip: string) {
    this.__name = name;
    this.__ip = ip;
  }
}
