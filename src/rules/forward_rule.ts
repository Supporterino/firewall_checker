import { Protocol, Rule, RuleType } from '.';
import { logger } from '../utils';

export class ForwardRule extends Rule {
  private __targetIP: string;
  public get targetIP(): string {
    return this.__targetIP;
  }
  public set targetIP(value: string) {
    this.__targetIP = value;
  }
  private __targetPort: number;
  public get targetPort(): number {
    return this.__targetPort;
  }
  public set targetPort(value: number) {
    this.__targetPort = value;
  }
  constructor(
    port: number,
    proto: Protocol,
    comment: string,
    type: RuleType,
    target: string,
    targetIP: string,
    targetPort: number,
    isRange: boolean = false
  ) {
    super(port, proto, comment, type, target, isRange);
    this.__targetIP = targetIP;
    this.__targetPort = targetPort;
  }
}
