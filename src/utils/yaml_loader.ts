import { logger } from '.';
import { load } from 'js-yaml';
import { existsSync, readFileSync } from 'fs';

export class YamlLoader {
  constructor() {
    logger.info('Creating YamlLoader');
  }

  isLoadable(path: string) {
    return existsSync(path);
  }

  loadYamlFile(path: string) {
    return load(readFileSync(path, 'utf-8'));
  }

  loadYamlFileWithKey(path: string, key: string) {
    const data: any = this.loadYamlFile(path);
    if (!data[key]) {
      logger.prettyError(Error(`Key (${key}) not in file (${path})`));
    }
    return data[key];
  }
}
