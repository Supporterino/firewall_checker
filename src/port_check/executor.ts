import { ExpectedResult, RunResult } from '.';
import { metrics_provider, port_check_provider } from '..';
import { logger, timed } from '../utils';

/**
 * Wrapper class to run all the promises from the `PortCheckProvier`
 */
export class Executor {
  constructor() {}

  /**
   * Execute the `PortCheck`s and send the result to the `MetricsProvider`
   */
  @timed
  run(): void {
    logger.info('Execution PortChecks')
    logger.debug('Updating last run time')
    metrics_provider.update();
    logger.debug('Running checks from the PortCheckProvider')
    port_check_provider.checks.forEach((a_check) => {
      a_check
        .getTask()
        .then(() => {
          if (a_check._expected === ExpectedResult.OPEN) metrics_provider.receiveMetric(RunResult.EXPECTED, a_check);
          else metrics_provider.receiveMetric(RunResult.EXPECTED_CLOSED_BUT_OPEN, a_check);
        })
        .catch(() => {
          if (a_check._expected === ExpectedResult.CLOSED) metrics_provider.receiveMetric(RunResult.EXPECTED, a_check);
          else metrics_provider.receiveMetric(RunResult.EXPECTED_OPEN_BUT_NO_RESPONSE, a_check);
        });
    });
  }
}
