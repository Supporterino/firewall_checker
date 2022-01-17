import { join } from 'path';
import { logger, YamlLoader } from './utils';

const loader = new YamlLoader();
logger.debug('Yaml data:', loader.loadYamlFileWithKey(join(process.cwd(), 'data/ansible/inventories/production/host_vars/snaps-h02/vars'), 'fw_host_allow_port'));
