import BullQueue from 'bull';
import TimerJob from '../entities/timerJob.js';
import { validate } from '../validator/index.js';

class TimerUtility {
  constructor (client) {
    this.client = client;
  }

  async register (handlers) {
    if (this._handlers) { return; }
    if (!this.client.config.redis) { throw new Error('Configuration lacks redis config'); }

    validate(handlers)
      .isInstanceOf(Object, `TimerUtility.register() parameter, handlers: ${handlers} must be an object`);

    validate(Object.values(handlers))
      .each()
      .isInstanceOf(Function, 'TimerUtility.register() parameter, handler[{index}]: {value} must be a function');

    this._handlers = handlers;

    this._queue = new BullQueue(
      `${this.client.config.keyword}-bull-timer`,
      {
        redis: this.client.config.get('redis'),
        prefix: `{${this.client.config.keyword}:${this.client.me.id}}`
      }
    );

    this._queue.process('*', (job) => {
      if (!Object.keys(this._handlers).includes(job.name)) {
        throw new Error(`[Timer]: Handler "${job.name}" does not exist in handlers`);
      }

      this._handlers[job.name].call(this, job.data);
    });
  }

  async get (jobId) {
    if (!this._handlers) { throw new Error('TimerUtility has not been initalised'); }

    { // eslint-disable-line no-lone-blocks
      validate(jobId)
        .isNotNullOrUndefined(`TimerUtility.get() parameter, jobId: ${jobId} is null or undefined`)
        .isNotEmptyOrWhitespace(`TimerUtility.get() parameter, jobId: ${jobId} is empty or whitespace`);
    }
    const job = await this._queue.getJob(jobId);

    return job
      ? new TimerJob(this.client, job)
      : null;
  }

  async add (jobId, handler, data, delay) {
    if (!this._handlers) { throw new Error('TimerUtility has not been initalised'); }
    { // eslint-disable-line no-lone-blocks
      validate(jobId)
        .isNotNullOrUndefined(`TimerUtility.add() parameter, jobId: ${jobId} is null or undefined`)
        .isNotEmptyOrWhitespace(`TimerUtility.add() parameter, jobId: ${jobId} is empty or whitespace`);

      validate(handler)
        .isNotNullOrUndefined(`TimerUtility.add() parameter, handler: ${handler} is null or undefined`)
        .isNotEmptyOrWhitespace(`TimerUtility.add() parameter, handler: ${handler} is empty or whitespace`)
        .isInList(Object.keys(this._handlers), `TimerUtility.add() parameter, handler: ${handler} is not valid`);

      validate(data)
        .isInstanceOf(Object, `TimerUtility.add() parameter, data: ${data} must be an object`);

      validate(delay)
        .isNotNullOrUndefined(`TimerUtility.add() parameter, delay: ${delay} is null or undefined`)
        .isValidNumber(`TimerUtility.add() parameter, delay: ${delay} is not a valid number`)
        .isGreaterThanZero(`TimerUtility.add() parameter, delay: ${delay} is less than or equal to zero`);
    }
    delay = Number(delay) || delay;

    await this.cancel(jobId);

    const job = await this._queue.add(
      handler,
      data,
      {
        delay,
        attempts: 8,
        removeOnComplete: true,
        removeOnFail: true,
        jobId
      }
    );

    return new TimerJob(this.client, job);
  }

  async cancel (jobId) {
    if (!this._handlers) { throw new Error('TimerUtility has not been initalised'); }
    { // eslint-disable-line no-lone-blocks
      validate(jobId)
        .isNotNullOrUndefined(`TimerUtility.cancel() parameter, jobId: ${jobId} is null or undefined`)
        .isNotEmptyOrWhitespace(`TimerUtility.cancel() parameter, jobId: ${jobId} is empty or whitespace`);
    }
    const job = await this._queue.getJob(jobId);

    if (!job) { return null; }

    return job.remove()
      .catch();
  }

  async extend (jobId, delay) {
    if (!this._handlers) { throw new Error('TimerUtility has not been initalised'); }
    { // eslint-disable-line no-lone-blocks
      validate(jobId)
        .isNotNullOrUndefined(`TimerUtility.extend() parameter, jobId: ${jobId} is null or undefined`)
        .isNotEmptyOrWhitespace(`TimerUtility.extend() parameter, jobId: ${jobId} is empty or whitespace`);

      validate(delay)
        .isNotNullOrUndefined(`TimerUtility.extend() parameter, delay: ${delay} is null or undefined`)
        .isValidNumber(`TimerUtility.extend() parameter, delay: ${delay} is not a valid number`)
        .isGreaterThanZero(`TimerUtility.extend() parameter, delay: ${delay} is less than or equal to zero`);
    }
    const job = await this._queue.getJob(jobId);

    if (!job) { return null; }

    await this.cancel(jobId);

    Reflect.deleteProperty(job.opts, 'timestamp'); // Remove this else the duration wont update #stupid.

    return this.add(jobId, job.name, job.data, delay);
  }
}

export default TimerUtility;
