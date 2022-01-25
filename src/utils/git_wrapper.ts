import { existsSync } from 'fs';
import { join } from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { logger } from './logger';

/**
 * This class provides a wrapper around the `SimpleGit` npm package to clone and pull for changes from the ansilbe repository
 */
export class GitUpdater {
  private gitCLI: SimpleGit;

  /**
   * Creates a new instance of the class and points the `git` wrapper to either the repository or the parent folder.
   */
  constructor() {
    logger.info('Creating new GitUpdater');
    if (this.checkIfRepoExists()) this.gitCLI = simpleGit(join(process.cwd(), 'data/ansible'));
    else this.gitCLI = simpleGit(join(process.cwd(), 'data'));
  }

  /**
   * Checks if the repository is already checked out by checking for the presence of the folder.
   * @returns Boolean which is `true` if the repo is checked out.
   */
  checkIfRepoExists(): boolean {
    return existsSync(join(process.cwd(), 'data', 'ansible'));
  }

  /**
   * This function checks if the repo is already checked out. If the repo is checked out a pull for changes is
   * triggered. Otherwise the repo is cloned from the remote with the `GITHUB_TOKEN` env var as auth and the wrapper
   * is switched to point to the repo.
   */
  cloneRepo(): void {
    if (this.checkIfRepoExists()) {
      logger.info('Repository is already cloned. Pulling...');
      this.pullChanges();
      return;
    }
    this.gitCLI.clone(`https://${process.env.GITHUB_TOKEN}@github.com/knuddelsgmbh/ansible.git`);
    this.gitCLI = simpleGit(join(process.cwd(), 'data/ansible'));
  }

  /**
   * Just pull for changes in the repository
   */
  pullChanges(): void {
    logger.info('Pulling changes for repository');
    this.gitCLI.pull();
  }

  /**
   * Pulls for changes in the repository and reports via a boolean if there were changes
   * @returns A promise which resolves into a boolean indicating if there were changes
   */
  async checkForChanges(): Promise<boolean> {
    const result = this.gitCLI.pull();
    if ((await result).summary.changes) return true;
    else return false;
  }
}
