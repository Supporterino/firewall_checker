import { existsSync } from 'fs';
import { join } from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { logger } from './logger';

export class GitUpdater {
  private gitCLI: SimpleGit;

  constructor() {
    logger.info('Creating new GitUpdater');
    if (this.checkIfRepoExists()) this.gitCLI = simpleGit(join(process.cwd(), 'data/ansible'));
    else this.gitCLI = simpleGit(join(process.cwd(), 'data'));
  }

  checkIfRepoExists(): boolean {
    return existsSync(join(process.cwd(), 'data', 'ansible'));
  }

  cloneRepo() {
    if (this.checkIfRepoExists()) {
      logger.info('Repository is already cloned. Pulling...');
      this.pullChanges();
      return;
    }
    this.gitCLI.clone(`https://${process.env.GITHUB_TOKEN}@github.com/knuddelsgmbh/ansible.git`);
    this.gitCLI = simpleGit(join(process.cwd(), 'data/ansible'));
  }

  pullChanges() {
    logger.info('Pulling changes for repository');
    this.gitCLI.pull();
  }

  async checkForChanges(): Promise<boolean> {
    const result = this.gitCLI.pull();
    if ((await result).summary.changes) return true;
    else return false;
  }
}
