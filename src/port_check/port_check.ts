import { Socket } from 'net';
import { ExpectedResult, RunResult } from '.';
import { Rule } from '../rules';
import { logger } from '../utils';

/**
 * This class is the actual `PortCheck` which is run against a host.
 */
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

  /**
   * Create a new `PortCheck` from the constructor args. The timeout is set via the `PORT_CHECK_TIMEOUT` env var or the default value of 1sec is used.
   * @param host the targeted hosts ip adress
   * @param port the targeted port of the host
   * @param expected the expected outcome of the test as `ExpectedResult` enum
   * @param rule the rule which created the test
   */
  constructor(host: string, port: number, expected: ExpectedResult, rule: Rule) {
    this.__host = host;
    this.__port = port;
    this.__rule = rule;
    this.__expected = expected;
    this.__timeout = <number>(process.env.PORT_CHECK_TIMEOUT || 1000);
    logger.debug(`Creating PortCheck for --> ${this.__host}:${this.__port}`)
  }

  /**
   * Returns the promise which runs the `PortCheck`
   * @returns a Promise which resolves if connection succeded and rejects if no connection is possible
   */
  getTask(): Promise<any> {
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
