import { logger } from '../utils';

export class Host {
  private __name: string;
  public get name(): string {
    return this.__name;
  }
  public set name(value: string) {
    this.__name = value;
  }
  private __ip: string;
  public get ip(): string {
    return this.__ip;
  }
  public set ip(value: string) {
    this.__ip = value;
  }

  constructor(name: string, ip: string) {
    this.__name = name;
    this.__ip = ip;
    logger.silly(`Initialized Host:`, this);
  }
}
