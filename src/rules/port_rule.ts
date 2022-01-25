import { Protocol, Rule, RuleType } from '.';

export class PortRule extends Rule {
  constructor(port: number, proto: Protocol, comment: string, type: RuleType, target: string, isRange: boolean = false) {
    super(port, proto, comment, type, target, isRange);
  }
}
