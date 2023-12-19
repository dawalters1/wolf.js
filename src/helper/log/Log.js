import Event from '../../constants/Event.js';
import LogLevel from '../../constants/LogLevel.js';
import WOLFAPIError from '../../models/WOLFAPIError.js';
import validator from '../../validator/index.js';
import Base from '../Base.js';

class Log extends Base {
  /**
   *
   * @param {import('../../client/WOLF.js').default} client
   */
  constructor (client) {
    super(client);

    if (process.eventNames().includes('unhandledRejection')) { return; }

    process.on('unhandledRejection', (error) =>
      !client.eventNames().includes('log')
        ? console.log(error?.stack ? error.stack : error.message, '\nparam:', error?.params)
        : this.client.emit(Event.LOG,
          {
            level: LogLevel.FATAL,
            message: error?.stack ? error.stack : error.message,
            params: error?.params
          }
        )
    );
  }

  /**
   * Log a debug message
   * @param {String} message
   * @returns {boolean}
   */
  debug (message) {
    if (validator.isNullOrUndefined(message)) {
      throw new WOLFAPIError('message cannot be null or undefined', { message });
    } else if (validator.isNullOrWhitespace(message)) {
      throw new WOLFAPIError('message cannot be null or empty', { message });
    }

    return this.client.emit(Event.LOG, { level: LogLevel.DEBUG, message });
  }

  /**
   * Log a info message
   * @param {String} message
   * @returns {boolean}
   */
  info (message) {
    if (validator.isNullOrUndefined(message)) {
      throw new WOLFAPIError('message cannot be null or undefined', { message });
    } else if (validator.isNullOrWhitespace(message)) {
      throw new WOLFAPIError('message cannot be null or empty', { message });
    }

    return this.client.emit(Event.LOG, { level: LogLevel.INFO, message });
  }

  /**
   * Log a warn message
   * @param {String} message
   * @returns {boolean}
   */
  warn (message) {
    if (validator.isNullOrUndefined(message)) {
      throw new WOLFAPIError('message cannot be null or undefined', { message });
    } else if (validator.isNullOrWhitespace(message)) {
      throw new WOLFAPIError('message cannot be null or empty', { message });
    }

    return this.client.emit(Event.LOG, { level: LogLevel.WARN, message });
  }

  /**
   * Log a error message
   * @param {String} message
   * @returns {boolean}
   */
  error (message) {
    if (validator.isNullOrUndefined(message)) {
      throw new WOLFAPIError('message cannot be null or undefined', { message });
    } else if (validator.isNullOrWhitespace(message)) {
      throw new WOLFAPIError('message cannot be null or empty', { message });
    }

    return this.client.emit(Event.LOG, { level: LogLevel.ERROR, message });
  }
}

export default Log;
