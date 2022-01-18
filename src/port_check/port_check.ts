import { Socket } from 'net';
import { ExpectedResult } from '.';
import { Rule } from '../rules';

export class PortCheck {
  private __host: string;
  private __port: number;
  private __rule: Rule;
  private __timeout: number;
  private __expected: ExpectedResult;

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
