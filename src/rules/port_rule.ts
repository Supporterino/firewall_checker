import { Protocol, Rule, RuleType } from ".";

export class PortRule extends Rule {
    constructor(port: number, proto: Protocol, comment: string, type: RuleType, target: string) {
        super(port, proto, comment, type, target)
    }
}