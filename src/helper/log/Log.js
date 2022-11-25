import Event from '../../constants/Event.js';
import LogLevel from '../../constants/LogLevel.js';
import WOLFAPIError from '../../models/WOLFAPIError.js';
import validator from '../../validator/index.js';
import Base from '../Base.js';

class Log extends Base {
  constructor (client) {
    super(client);

    process.on('unhandledRejection', (error) => this.client.emit(Event.LOG, LogLevel.FATAL, error));
  }

  debug (message) {
    if (validator.isNullOrUndefined(message)) {
      throw new WOLFAPIError('message cannot be null or undefined', { message });
    } else if (validator.isNullOrWhitespace(message)) {
      throw new WOLFAPIError('message cannot be null or empty', { message });
    }

    return this.client.emit(Event.LOG, LogLevel.DEBUG, message);
  }

  info (message) {
    if (validator.isNullOrUndefined(message)) {
      throw new WOLFAPIError('message cannot be null or undefined', { message });
    } else if (validator.isNullOrWhitespace(message)) {
      throw new WOLFAPIError('message cannot be null or empty', { message });
    }

    return this.client.emit(Event.LOG, LogLevel.INFO, message);
  }

  warn (message) {
    if (validator.isNullOrUndefined(message)) {
      throw new WOLFAPIError('message cannot be null or undefined', { message });
    } else if (validator.isNullOrWhitespace(message)) {
      throw new WOLFAPIError('message cannot be null or empty', { message });
    }

    return this.client.emit(Event.LOG, LogLevel.WARN, message);
  }

  error (message) {
    if (validator.isNullOrUndefined(message)) {
      throw new WOLFAPIError('message cannot be null or undefined', { message });
    } else if (validator.isNullOrWhitespace(message)) {
      throw new WOLFAPIError('message cannot be null or empty', { message });
    }

    return this.client.emit(Event.LOG, LogLevel.ERROR, message);
  }
}

export default Log;
