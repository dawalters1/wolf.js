import BullQueue from 'bull';
import WOLFAPIError from '../../models/WOLFAPIError.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';

class Timer {
  constructor (client) {
    this.client = client;
  }

  async initialise (handlers, ...args) {
    if (typeof handlers !== 'object') {
      throw new WOLFAPIError('handlers must be an object!', { handlers });
    } else if (!Object.keys(handlers).length > 0) {
      throw new WOLFAPIError('handlers must contain at least 1 handler', { handlers });
    }
    this._handlers = handlers;

    this._timerQueue = new BullQueue(
      'bull-timer',
      {
        redis: this.client.config.get('redis'),
        prefix: `{${this.client.config.keyword}:${this.client.currentSubscriber.id}}`
      }
    );

    this._timerQueue.process('*', (job) => {
      if (!Object.keys(handlers).includes(job.name)) {
        throw new WOLFAPIError('handler does not exist in handlers', { handler: job.name, handlers: Object.keys(this._handlers) });
      }

      handlers[job.name](this.client, job.data, ...args);

      return Promise.resolve();
    });

    await this._timerQueue.isReady();
    this._initialised = true;

    return Promise.resolve();
  }

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
      return await job.remove();
    }

    return null;
  }

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
