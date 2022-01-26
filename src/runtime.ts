import { AsyncTask, SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import { inventory_provider, rule_provider, port_check_provider, metrics_provider, git_updater, executor } from '.';

/**
 * This class wrappes the normal program flow and creates the scheduler to realise this flow
 */
export class Runtime {
  private __scheduler: ToadScheduler;
  constructor() {
    this.__scheduler = new ToadScheduler();
  }

  /**
   * This function starts the program flow by first executing the checkout of the repo and update of each component.
   * Then a schedueler is created which checks for changes on the remote every 2 hours and if there are changes component
   * updates are triggered. It also registers a task which runs the checks every 20 mins
   */
  start(): void {
    git_updater.cloneRepo();
    inventory_provider.update();
    rule_provider.update();
    port_check_provider.update();
    metrics_provider.update();
    const update_task = new AsyncTask('update from git', () => {
      return git_updater.checkForChanges().then((res) => {
        if (res) {
          inventory_provider.update();
          rule_provider.update();
          port_check_provider.update();
        }
      });
    });
    const run_task = new Task('run the executor', () => {
      executor.run();
    });
    const update_job = new SimpleIntervalJob({ hours: 2, runImmediately: false }, update_task);
    const run_job = new SimpleIntervalJob({ minutes: 20, runImmediately: true }, run_task);
    this.__scheduler.addSimpleIntervalJob(update_job);
    this.__scheduler.addSimpleIntervalJob(run_job);
  }
}
