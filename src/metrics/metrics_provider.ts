import { logger, Provider } from '../utils';
import express from 'express';
import helmet from 'helmet';
import { hostname, networkInterfaces } from 'os';
import { PortCheck, RunResult } from '../port_check';

export class MetricsProvider implements Provider {
  private __app: express.Application;
  private __port: number;
  private __metrics: Array<string>;
  private __updateCounter: number;

  constructor() {
    this.__metrics = new Array<string>();
    this.__port = <number>(process.env.PORT || 4242);
    this.__updateCounter = 0;
    this.__app = express();
    this.__app.use(helmet());
    this.__app.enable('trust proxy');
    this.__app.get('/metrics', (req, res) => {
      res.send(this.__metrics.join('<br/>'));
    });
    this.__app.listen(this.__port, () => {
      logger.info(`Started MetricsProvier on port ${this.__port}.`);
    });
  }

  update(): void {
    this.__metrics = new Array<string>();
    this.__updateCounter++
    this.addMetric('port_check_update_count', this.__updateCounter, [{ last_update: (new Date()).toString() }]);
  }

  receiveMetric(result: RunResult, check: PortCheck): void {
    switch (result) {
      case RunResult.EXPECTED:
        this.addMetric('port_check_result', 0, [{ to_ip: check._host }, { to_port: check._port }, { type: check._rule.constructor.name }]);
        break;
      case RunResult.EXPECTED_CLOSED_BUT_OPEN:
        this.addMetric('port_check_result', 1, [{ to_ip: check._host }, { to_port: check._port }, { type: check._rule.constructor.name }]);
        break;
      case RunResult.EXPECTED_OPEN_BUT_NO_RESPONSE:
        this.addMetric('port_check_result', 2, [{ to_ip: check._host }, { to_port: check._port }, { type: check._rule.constructor.name }]);
        break;
      default:
        break;
    }
  }

  addMetric(name: string, value: number, labels?: Array<any>): void {
    if (!labels) labels = [];

    labels.push({ host: hostname() });
    let label_string = '';

    for (const label of labels) {
      for (const k in label) {
        if (label_string === '') label_string += `${k}='${label[k]}'`;
        else label_string += `, ${k}='${label[k]}'`;
      }
    }

    this.__metrics.push(`${name}{${label_string}} ${value}`);
  }

  stats(): string {
    throw new Error('Method not implemented.');
  }
}
