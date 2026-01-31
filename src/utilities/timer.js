import BaseUtility from './BaseUtility.js';
import BullQueue from 'bull';
import TimerJob from '../entities/timerJob.js';
import { validate } from '../validation/Validation.js';

export default class TimerUtility extends BaseUtility {
  #handlers = new Map();
  #queue;

  async register (handlers) {
    if (this.#handlers) { return; }
    if (!this.client.config.redis) { throw new Error('Configuration lacks redis config'); }

    this.#handlers = handlers;

    this.#queue = new BullQueue(
      `${this.client.config.keyword}-bull-timer`,
      {
        redis: this.client.config.get('redis'),
        prefix: `{${this.client.config.keyword}:${this.client.me.id}}`
      }
    );

    this.#queue.process('*', (job) => {
      if (!Object.keys(this.#handlers).includes(job.name)) {
        throw new Error(`[Timer]: Handler "${job.name}" does not exist in handlers`);
      }

      this.#handlers[job.name].call(this, job.data);
    });
  }

  async get (jobId) {
    if (!this.#handlers) { throw new Error('TimerUtility has not been initalised'); }

    validate(jobId, this, this.get)
      .isNotNullOrUndefined()
      .isNotWhitespace();

    const job = await this.#queue.getJob(jobId);

    return job
      ? new TimerJob(this.client, job)
      : null;
  }

  async add (jobId, handler, data, delay) {
    if (!this.#handlers) { throw new Error('TimerUtility has not been initalised'); }

    const normalisedDelay = this.normaliseNumber(delay);

    validate(jobId, this, this.add)
      .isNotNullOrUndefined()
      .isNotWhitespace();

    validate(handler, this, this.add)
      .isNotNullOrUndefined()
      .isNotWhitespace()
      .in(Object.keys(this.#handlers));

    validate(normalisedDelay, this, this.add)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberLessThanZero();

    await this.cancel(jobId);

    const job = await this.#queue.add(
      handler,
      data,
      {
        delay: normalisedDelay,
        attempts: 8,
        removeOnComplete: true,
        removeOnFail: true,
        jobId
      }
    );

    return new TimerJob(this.client, job);
  }

  async cancel (jobId) {
    if (!this.#handlers) { throw new Error('TimerUtility has not been initalised'); }

    validate(jobId, this, this.cancel)
      .isNotNullOrUndefined()
      .isNotWhitespace();

    const job = await this.#queue.getJob(jobId);

    if (!job) { return null; }

    return job.remove()
      .catch();
  }

  async extend (jobId, delay) {
    if (!this.#handlers) { throw new Error('TimerUtility has not been initalised'); }

    const normalisedDelay = this.normaliseNumber(delay);

    validate(jobId, this, this.add)
      .isNotNullOrUndefined()
      .isNotWhitespace();

    validate(normalisedDelay, this, this.add)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberLessThanZero();

    const job = await this.#queue.getJob(jobId);

    if (!job) { return null; }

    await this.cancel(jobId);

    Reflect.deleteProperty(job.opts, 'timestamp'); // Remove this else the duration wont update #stupid.

    return this.add(
      jobId,
      job.name,
      job.data,
      normalisedDelay
    );
  }
}
