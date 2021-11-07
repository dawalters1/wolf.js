const BullQueue = require('bull');

const validator = require('../../validator');

class Timer {
  constructor (api) {
    this._api = api;
  }

  async initialise (handlers, ...args) {
    if (this._initialised) {
      return Promise.resolve();
    }

    this._handlers = handlers;

    this._timerQueue = new BullQueue('{bull-timer}', {
      redis: this._api.config.redis,
      prefix: this._api.options.keyword || this._api.config.keyword
    });

    this._timerQueue.process('*', (job) => {
      if (!Object.keys(handlers).includes(job.name)) {
        throw new Error(`Unable to locate handler[name:${job.name}]`);
      }
      try {
        handlers[job.name](this._api, job.data, ...args);
      } catch (error) {
        throw new Error(`Error occurred while handling event[name:${job.name}, id:${job.id}`);
      }
      return Promise.resolve();
    });

    await this._timerQueue.isReady();

    this._initialised = true;

    return Promise.resolve();
  }

  async add (name, handler, data, duration) {
    if (!this._initialised) {
      throw new Error('timer queue has not been initialised using api.utility().timer().initialise(...)');
    }

    if (typeof name !== 'string') {
      throw new Error('name must be a string');
    } else if (validator.isNullOrWhitespace(name)) {
      throw new Error('name cannot be null or empty');
    }

    if (typeof handler !== 'string') {
      throw new Error('handler must be a string');
    } else if (validator.isNullOrWhitespace(handler)) {
      throw new Error('handler cannot be null or empty');
    } else if (!Object.keys(this._handlers).includes(handler)) {
      throw new Error(`handler[name:${handler}] does not exist in handlers[${Object.keys(this._handlers).join(', ')}]`);
    }

    if (typeof data !== 'object') {
      throw new Error('data must be an object!');
    } else if (!Object.keys(data).length > 0) {
      throw new Error('data must contain at least 1 property');
    }

    if (!validator.isValidNumber(duration)) {
      throw new Error('duration must be a valid number');
    } else if (validator.isLessThanOrEqualZero(duration)) {
      throw new Error('duration cannot be less than or equal to 0');
    }

    await this._timerQueue.removeJobs(name);

    const _opts = {
      delay: duration,
      attempts: 8,
      removeOnComplete: true,
      removeOnFail: true,
      jobId: name
    };

    return await this._timerQueue.add(handler, data, _opts);
  }

  async cancel (name) {
    if (!this._initialised) {
      throw new Error('timer queue has not been initialised using api.utility().timer().initialise(...)');
    }

    if (typeof name !== 'string') {
      throw new Error('name must be a string');
    } else if (validator.isNullOrWhitespace(name)) {
      throw new Error('name cannot be null or empty');
    }

    await this._timerQueue.removeJobs(name);

    return Promise.resolve();
  }

  async get (name) {
    if (!this._initialised) {
      throw new Error('timer queue has not been initialised using api.utility().timer().initialise(...)');
    }

    if (typeof name !== 'string') {
      throw new Error('name must be a string');
    } else if (validator.isNullOrWhitespace(name)) {
      throw new Error('name cannot be null or empty');
    }

    const job = await this._timerQueue.getJob(name);

    if (job) {
      job.remaining = (job.timestamp + job.delay) - Date.now();
    }

    return job;
  }

  async delay (name, duration) {
    if (!this._initialised) {
      throw new Error('timer queue has not been initialised using api.utility().timer().initialise(...)');
    }

    if (typeof name !== 'string') {
      throw new Error('name must be a string');
    } else if (validator.isNullOrWhitespace(name)) {
      throw new Error('name cannot be null or empty');
    }

    if (!validator.isValidNumber(duration)) {
      throw new Error('duration must be a valid number');
    } else if (validator.isLessThanOrEqualZero(duration)) {
      throw new Error('duration cannot be less than or equal to 0');
    }

    const existing = await this._timerQueue.getJob(name);

    if (existing) {
      Reflect.deleteProperty(existing.opts, 'timestamp'); // Remove this else the duration wont update #stupid.

      const _opts = {
        ...existing.opts,
        delay: duration
      };

      await this._timerQueue.removeJobs(name);

      return await this._timerQueue.add(existing.name, existing.data, _opts);
    }

    return Promise.resolve();
  }
}

module.exports = Timer;
