import { Protocol, Rule, RuleType } from ".";

export class TargetedIPRule extends Rule {
    private __targetedIP: string;
    public get targetedIP(): string {
        return this.__targetedIP;
    }
    public set targetedIP(value: string) {
        this.__targetedIP = value;
    }
    constructor(port: number, proto: Protocol, comment: string, type: RuleType, target: string, targetIP: string) {
        super(port, proto, comment, type, target)
        this.__targetedIP = targetIP
    }
}