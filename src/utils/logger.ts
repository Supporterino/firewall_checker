import { appendFileSync } from 'fs';
import { join } from 'path';
import { ILogObject, Logger, TLogLevelName } from 'tslog';

const loglevel = process.env.LOG_LEVEL || 'silly';
const writeLogFile = (logObject: ILogObject): void => {
  // appendFileSync(join(process.cwd(), 'logs/main.log'), logObject + '\n');
};

export const logger = new Logger({
  name: 'firewall_checker',
  minLevel: loglevel as TLogLevelName,
  dateTimeTimezone: 'Europe/Berlin'
});

logger.attachTransport(
  {
    silly: writeLogFile,
    debug: writeLogFile,
    trace: writeLogFile,
    info: writeLogFile,
    warn: writeLogFile,
    error: writeLogFile,
    fatal: writeLogFile
  },
  'debug'
);
