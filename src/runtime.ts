import { AsyncTask, SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import { inventory_provider, rule_provider, port_check_provider, metrics_provider, git_updater, executor } from '.';

export class Runtime {
  private __scheduler: ToadScheduler;
  constructor() {
    this.__scheduler = new ToadScheduler();
  }

  start() {
    git_updater.cloneRepo();
    (async () => { 
      console.log('before delay')
      await new Promise(f => setTimeout(f, 100000));
      console.log('after delay')
  })();
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
    const run_job = new SimpleIntervalJob({ minutes: 20, runImmediately: false }, run_task);
    this.__scheduler.addSimpleIntervalJob(update_job);
    this.__scheduler.addSimpleIntervalJob(run_job);
  }
}
