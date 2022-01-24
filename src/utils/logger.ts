import { Logger, TLogLevelName } from 'tslog';

const loglevel = process.env.LOG_LEVEL || 'silly';

export const logger = new Logger({
  name: 'firewall_checker',
  minLevel: loglevel as TLogLevelName,
  dateTimeTimezone: 'Europe/Berlin'
});
