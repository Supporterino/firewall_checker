import { logger, Provider } from '../utils';
import express, { json } from 'express';
import helmet from 'helmet';
import { hostname } from 'os';
import { getExpectedAsString, PortCheck, RunResult } from '../port_check';
import { router } from '.';

/**
 * This class provides the webserver for the metrics, docs and api endpoint and is reponsible for creating the metrics from the ran `PortCheck`s
 */
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
    this.__app.use(json());
    this.__app.enable('trust proxy');
    this.__app.use('/api', router);
    this.__app.use('/docs', express.static('./docs'));
    this.__app.get('/metrics', (req, res) => {
      res.send(`${this.__metrics.join('\n\n')}\n`);
    });
    this.__app.listen(this.__port, () => {
      logger.info(`Started MetricsProvier on port ${this.__port}.`);
    });
  }

  /**
   * Clears the metrics array and increases the update counter and sets the new last updated time
   */
  update(): void {
    this.__metrics = new Array<string>();
    this.__updateCounter++;
    this.addMetric('port_check_update_count', this.__updateCounter, [{ last_update: new Date().toString() }]);
  }

  /**
   * Build the metric from an ran `PortCheck`
   * @param result the `RunResult`
   * @param check the `PortCheck` which was ran
   */
  receiveMetric(result: RunResult, check: PortCheck): void {
    switch (result) {
      case RunResult.EXPECTED:
        this.addMetric('port_check_result', 0, [
          { to_ip: check._host },
          { to_port: check._port },
          { type: check._rule.constructor.name },
          { expected: getExpectedAsString(check._expected) }
        ]);
        break;
      case RunResult.EXPECTED_CLOSED_BUT_OPEN:
        this.addMetric('port_check_result', 1, [
          { to_ip: check._host },
          { to_port: check._port },
          { type: check._rule.constructor.name },
          { expected: getExpectedAsString(check._expected) }
        ]);
        break;
      case RunResult.EXPECTED_OPEN_BUT_NO_RESPONSE:
        this.addMetric('port_check_result', 2, [
          { to_ip: check._host },
          { to_port: check._port },
          { type: check._rule.constructor.name },
          { expected: getExpectedAsString(check._expected) }
        ]);
        break;
      default:
        break;
    }
  }

  /**
   * Build a metric string from the given parameters and add it to the metrics array
   * @param name the name of the metric
   * @param value the value of the metric
   * @param labels the additional labels for the metric as an array. [{ label_name: labek_value }]
   */
  private addMetric(name: string, value: number, labels?: Array<any>): void {
    if (!labels) labels = [];

    if (process.env.NODE_ENV === 'production') labels.push({ host: process.env.HOSTNAME });
    else labels.push({ host: hostname() });

    let label_string = '';

    for (const label of labels) {
      for (const k in label) {
        if (label_string === '') label_string += `${k}="${label[k]}"`;
        else label_string += `, ${k}="${label[k]}"`;
      }
    }

    this.__metrics.push(`${name}{${label_string}} ${value}`);
  }

  /**
   * Method not implemented.
   */
  stats(): string {
    throw new Error('Method not implemented.');
  }
}
