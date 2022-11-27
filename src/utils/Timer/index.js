const BullQueue = require('bull');
const TimerJobObject = require('../../models/TimerJobObject');

const validator = require('../../validator');

class Timer {
  constructor (api) {
    this._api = api;
  }

  async _reset () {
    this._initialised = false;
    this._handlers = {};
    this._timerQueue = null;
  }

  async initialise (handlers, ...args) {
    try {
      if (this._initialised) {
        return Promise.resolve();
      }

      if (!this._api._currentSubscriber) {
        throw new Error('client must be logged in');
      }

      this._handlers = handlers;

      this._timerQueue = new BullQueue('bull-timer', {
        redis: this._api.config.get('redis'),
        prefix: `{${this._api.options.keyword}:${this._api._currentSubscriber.id}}`
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
    } catch (error) {
      error.internalErrorMessage = `api.utility().timer().initialise(handlers=${JSON.stringify(handlers)}, args=${JSON.stringify(args)})`;
      throw error;
    }
  }

  async add (name, handler, data, duration) {
    try {
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

      const job = await this._timerQueue.add(handler, data, _opts);

      job.remaining = (job.timestamp + job.delay) - Date.now();

      return new TimerJobObject(job);
    } catch (error) {
      error.internalErrorMessage = `api.utility().timer().add(name=${JSON.stringify(name)}, handler=${JSON.stringify(handler)}, data=${JSON.stringify(data)}, duration=${JSON.stringify(duration)})`;
      throw error;
    }
  }

  async cancel (name) {
    try {
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
        return await job.remove();
      }

      return Promise.resolve();
    } catch (error) {
      error.internalErrorMessage = `api.utility().timer().cancel(name=${JSON.stringify(name)})`;
      throw error;
    }
  }

  async get (name) {
    try {
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
        return new TimerJobObject(job);
      }

      return job;
    } catch (error) {
      error.internalErrorMessage = `api.utility().timer().get(name=${JSON.stringify(name)})`;
      throw error;
    }
  }

  async delay (name, duration) {
    try {
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

        const job = await this._timerQueue.add(existing.name, existing.data, _opts);

        job.remaining = (job.timestamp + job.delay) - Date.now();

        return new TimerJobObject(job);
      }

      return Promise.resolve();
    } catch (error) {
      error.internalErrorMessage = `api.utility().timer().delay(name=${JSON.stringify(name)}, duration=${JSON.stringify(duration)})`;
      throw error;
    }
  }
}

module.exports = Timer;
