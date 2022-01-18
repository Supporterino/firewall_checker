import { Protocol, RuleType } from '.';
import { logger } from '../utils';

export abstract class Rule {
  private __port: number;
  public get port(): number {
    return this.__port;
  }
  public set port(value: number) {
    this.__port = value;
  }
  private __proto: Protocol;
  public get proto(): Protocol {
    return this.__proto;
  }
  public set proto(value: Protocol) {
    this.__proto = value;
  }
  private __comment: string;
  public get comment(): string {
    return this.__comment;
  }
  public set comment(value: string) {
    this.__comment = value;
  }
  private __type: RuleType;
  public get type(): RuleType {
    return this.__type;
  }
  public set type(value: RuleType) {
    this.__type = value;
  }
  private __target: string;
  public get target(): string {
    return this.__target;
  }
  public set target(value: string) {
    this.__target = value;
  }

  constructor(port: number, proto: Protocol, comment: string, type: RuleType, target: string) {
    this.__port = port;
    this.__proto = proto;
    this.__comment = comment;
    this.__type = type;
    this.__target = target;
    logger.silly(`Creating ${this.constructor.name}:`, this);
  }
}
