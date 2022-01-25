import { logger } from '.';
import { load } from 'js-yaml';
import { existsSync, readFileSync } from 'fs';

/**
 * This class provides a basic `YamlLoader` which can check if there is a yaml file to load present and is able to load the whole file or just a sub key of the file.
 */
export class YamlLoader {
  constructor() {
    logger.info('Creating YamlLoader');
  }

  /**
   * This function checks if there is a yaml file at the provided `path`
   * @param path the absolut path to the yaml file which shall be checked
   * @returns boolean indecating if a file is present
   */
  isLoadable(path: string): boolean {
    logger.debug(`Checking for yaml file at ${path}`);
    return existsSync(path);
  }

  /**
   * This function loads a given yaml file via the `path` parameter
   * @param path the absolut path to the yaml file which shall be loaded
   * @returns the yaml data as a JavaScript object
   */
  loadYamlFile(path: string): any {
    logger.debug(`Loading yaml file at ${path}`);
    return load(readFileSync(path, 'utf-8'));
  }

  /**
   * This function loads a given yaml file via the `path` parameter and only returns the given key via the `key` parameter of the yaml file.
   * @param path the absolut path to the yaml file which shall be loaded
   * @param key the key inside the yaml file which should be returned
   * @returns the yaml data as a JavaScript object
   */
  loadYamlFileWithKey(path: string, key: string): any {
    logger.debug(`Loading yaml file at ${path} and returning key: ${key}`);
    const data: any = this.loadYamlFile(path);
    if (!data[key]) {
      logger.prettyError(Error(`Key (${key}) not in file (${path})`));
    }
    return data[key];
  }
}
