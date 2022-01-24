import { Socket } from 'net';
import { ExpectedResult, RunResult } from '.';
import { Rule } from '../rules';

export class PortCheck {
  private __host: string;
  public get _host(): string {
    return this.__host;
  }
  public set _host(value: string) {
    this.__host = value;
  }
  private __port: number;
  public get _port(): number {
    return this.__port;
  }
  public set _port(value: number) {
    this.__port = value;
  }
  private __rule: Rule;
  public get _rule(): Rule {
    return this.__rule;
  }
  public set _rule(value: Rule) {
    this.__rule = value;
  }
  private __timeout: number;
  private __expected: ExpectedResult;
  public get _expected(): ExpectedResult {
    return this.__expected;
  }
  public set _expected(value: ExpectedResult) {
    this.__expected = value;
  }

  constructor(host: string, port: number, expected: ExpectedResult, rule: Rule) {
    this.__host = host;
    this.__port = port;
    this.__rule = rule;
    this.__expected = expected;
    this.__timeout = <number>(process.env.PORT_CHECK_TIMEOUT || 1000);
  }

  getTask() {
    return new Promise((resolve, reject) => {
      const socket = new Socket();

      const onError = () => {
        socket.destroy();
        reject();
      };

      socket.setTimeout(this.__timeout);
      socket.once('error', onError);
      socket.once('timeout', onError);

      socket.connect(this.__port, this.__host, () => {
        socket.end();
        resolve(1);
      });
    });
  }
}
