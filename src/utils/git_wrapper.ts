import { join } from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { logger } from './logger';

export class GitUpdater {
  private gitCLI: SimpleGit;

  constructor() {
    this.gitCLI = simpleGit(join(process.cwd(), 'data'));
  }

  cloneRepo() {
      this.gitCLI.clone('git@github.com:knuddelsgmbh/ansible.git')
  }
}
