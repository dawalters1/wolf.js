import { createLogger, format, transports } from 'winston';
const colors = {
  ERROR: '\x1b[31m', // red
  WARN: '\x1b[33m', // yellow
  INFO: '\x1b[32m', // green
  DEBUG: '\x1b[36m' // cyan
};

const reset = '\x1b[0m';

export default class Logger {
  #logger;

  constructor (client, config) {
    this.#logger = createLogger(config ?? {
      level: client.config.get('log_level') || 'debug',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.printf(({ level, message, stack }) => {
          const type = level.toUpperCase();

          const color = colors[type] || reset;

          return `${color}[${type}]${reset} ${stack || message}`;
        })
      ),
      transports: [
        new transports.Console()
      ]
    });
  }

  info (message, ...meta) {
    this.#logger.info(message, meta);
  }

  error (message, ...meta) {
    this.#logger.error(message, meta);
  }

  warn (message, ...meta) {
    this.#logger.warn(message, meta);
  }

  debug (message, ...meta) {
    this.#logger.debug(message, meta);
  }
}
