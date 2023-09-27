import BullQueue from 'bull';
import WOLFAPIError from '../../models/WOLFAPIError.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';

class Timer {
  constructor (client) {
    this.client = client;
    this._handlers = {};
    this._initialised = false;
  }

  /**
   * Initialise the timer utility
   * @param {{ [key: string]: Function }} handlers
   * @returns {Promise<void>}
   */
  async register (handlers) {
    if (typeof handlers !== 'object') {
      throw new WOLFAPIError('handlers must be an object!', { handlers });
    } else if (!Object.keys(handlers).length > 0) {
      throw new WOLFAPIError('handlers must contain at least 1 handler', { handlers });
    } else if (Object.values(handlers).some((handler) => typeof handler !== 'function')) {
      throw new WOLFAPIError('handler must be a function', { handlerName: Object.entries(handlers).find((handler) => typeof handler[1] !== 'function')[0] });
    }

    this._timerQueue = new BullQueue(
      'bull-timer',
      {
        redis: this.client.config.get('redis'),
        prefix: `{${this.client.config.keyword}:${this.client.currentSubscriber.id}}`
      }
    );

    this._timerQueue.process('*', (job) => {
      if (!Object.keys(this._handlers).includes(job.name)) {
        throw new WOLFAPIError('handler does not exist in handlers', { handler: job.name, handlers: Object.keys(this._handlers) });
      }

      this._handlers[job.name].call(this, job.data);
    });

    this._handlers = handlers;
    this._initialised = true;
  }

  /**
   * Create an event timer
   * @param {String} name
   * @param {String} handler
   * @param {Object} data
   * @param {Number} duration
   * @returns {Promise<TimerJob>}
   */
  async add (name, handler, data, duration) {
    if (!this._initialised) {
      throw new WOLFAPIError('timer queue has not been initialised');
    }

    if (validator.isNullOrUndefined(name)) {
      throw new WOLFAPIError('name cannot be null or undefined', { name });
    } else if (validator.isNullOrWhitespace(name)) {
      throw new WOLFAPIError('name cannot be null or empty', { name });
    }

    if (validator.isNullOrUndefined(handler)) {
      throw new WOLFAPIError('handler cannot be null or undefined', { handler });
    } else if (validator.isNullOrWhitespace(handler)) {
      throw new WOLFAPIError('handler cannot be null or empty', { handler });
    } else if (!Object.keys(this._handlers).includes(handler)) {
      throw new WOLFAPIError('handler does not exist in handlers', { handler, handlers: Object.keys(this._handlers) });
    }

    if (typeof data !== 'object') {
      throw new WOLFAPIError('data must be an object', { data });
    } else if (!Object.keys(data).length > 0) {
      throw new WOLFAPIError('data must contain at least 1 property', { data });
    }

    if (validator.isValidNumber(name)) {
      throw new WOLFAPIError('duration must be a valid number', { duration });
    } else if (validator.isLessThanOrEqualZero(name)) {
      throw new WOLFAPIError('duration cannot be less than or equal to 0', { duration });
    }

    await this.cancel(name);

    return new models.TimerJob(this.client,
      await this._timerQueue.add(
        handler,
        data,
        {
          delay: parseInt(duration),
          attempts: 8,
          removeOnComplete: true,
          removeOnFail: true,
          jobId: name
        }
      )
    );
  }

  /**
   * Cancel an event timer
   * @param {String} name
   * @returns {Promise<TimerJob>}
   */
  async cancel (name) {
    if (!this._initialised) {
      throw new WOLFAPIError('timer queue has not been initialised');
    }

    if (validator.isNullOrUndefined(name)) {
      throw new WOLFAPIError('name cannot be null or undefined', { name });
    } else if (validator.isNullOrWhitespace(name)) {
      throw new WOLFAPIError('name cannot be null or empty', { name });
    }

    const job = await this._timerQueue.getJob(name);

    if (job) {
      return job.remove()
        .then(() => Promise.resolve())
        .catch((error) => {
          this.client.log.error(error);
          Promise.resolve();
        });
    }

    return null;
  }

  /**
   * Get an event timer
   * @param {String} name
   * @returns {Promise<TimerJob>}
   */
  async get (name) {
    if (!this._initialised) {
      throw new WOLFAPIError('timer queue has not been initialised');
    }

    if (validator.isNullOrUndefined(name)) {
      throw new WOLFAPIError('name cannot be null or undefined', { name });
    } else if (validator.isNullOrWhitespace(name)) {
      throw new WOLFAPIError('name cannot be null or empty', { name });
    }

    const job = await this._timerQueue.getJob(name);

    if (job) {
      return new models.TimerJob(this.client, job);
    }

    return null;
  }

  /**
   * Change when the event should fire
   * @param {String} name
   * @param {Number} duration
   * @returns {Promise<TimerJob>}
   */
  async delay (name, duration) {
    if (!this._initialised) {
      throw new WOLFAPIError('timer queue has not been initialised');
    }

    if (validator.isNullOrUndefined(name)) {
      throw new WOLFAPIError('name cannot be null or undefined', { name });
    } else if (validator.isNullOrWhitespace(name)) {
      throw new WOLFAPIError('name cannot be null or empty', { name });
    }

    if (validator.isValidNumber(name)) {
      throw new WOLFAPIError('duration must be a valid number', { duration });
    } else if (validator.isLessThanOrEqualZero(name)) {
      throw new WOLFAPIError('duration cannot be less than or equal to 0', { duration });
    }

    const existing = await this._timerQueue.getJob(name);

    if (existing) {
      Reflect.deleteProperty(existing.opts, 'timestamp'); // Remove this else the duration wont update #stupid.
      await this.cancel(name);

      return new models.TimerJob(
        this.client,

        await this._timerQueue.add(
          existing.name,
          existing.data,
          {
            ...existing.opts,
            delay: parseInt(duration)
          }
        )
      );
    }

    return null;
  }
}

export default Timer;
