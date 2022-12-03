import Event from '../../constants/Event.js';
import LogLevel from '../../constants/LogLevel.js';
import WOLFAPIError from '../../models/WOLFAPIError.js';
import validator from '../../validator/index.js';
import Base from '../Base.js';

class Log extends Base {
  constructor (client) {
    super(client);

    process.on('unhandledRejection', (error) => this.client.emit(Event.LOG, { level: LogLevel.FATAL, message: error?.stack ? error.stack : error.message }));
  }

  debug (message) {
    if (validator.isNullOrUndefined(message)) {
      throw new WOLFAPIError('message cannot be null or undefined', { message });
    } else if (validator.isNullOrWhitespace(message)) {
      throw new WOLFAPIError('message cannot be null or empty', { message });
    }

    return this.client.emit(Event.LOG, { level: LogLevel.DEBUG, message });
  }

  info (message) {
    if (validator.isNullOrUndefined(message)) {
      throw new WOLFAPIError('message cannot be null or undefined', { message });
    } else if (validator.isNullOrWhitespace(message)) {
      throw new WOLFAPIError('message cannot be null or empty', { message });
    }

    return this.client.emit(Event.LOG, { level: LogLevel.INFO, message });
  }

  warn (message) {
    if (validator.isNullOrUndefined(message)) {
      throw new WOLFAPIError('message cannot be null or undefined', { message });
    } else if (validator.isNullOrWhitespace(message)) {
      throw new WOLFAPIError('message cannot be null or empty', { message });
    }

    return this.client.emit(Event.LOG, { level: LogLevel.WARN, message });
  }

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
