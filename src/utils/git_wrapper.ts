import { existsSync } from 'fs';
import { join } from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { logger } from './logger';

export class GitUpdater {
  private gitCLI: SimpleGit;

  constructor() {
    logger.info('Creating new GitUpdater');
    this.gitCLI = simpleGit(join(process.cwd(), 'data'));
  }

  cloneRepo() {
    if (existsSync(join(process.cwd(), 'data', 'ansible'))) {
      logger.info('Repository is already cloned. Pulling...');
      this.pullChanges();
      return;
    }
    this.gitCLI.clone('git@github.com:knuddelsgmbh/ansible.git');
  }

  pullChanges() {
    logger.info('Pulling changes for repository');
    this.gitCLI.pull();
  }
}
