import { Logger, TLogLevelName } from 'tslog';

/**
 * Read the log level from the enviroment variables or set it to `silly`
 */
const loglevel = process.env.LOG_LEVEL || 'silly';

/**
 * Export the logger object for the project with the previously set log level
 */
export const logger = new Logger({
  name: 'firewall_checker',
  minLevel: loglevel as TLogLevelName,
  dateTimeTimezone: 'Europe/Berlin'
});
