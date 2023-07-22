import Base from './Base.js';

class TimerJob extends Base {
  constructor (client, job) {
    super(client);
    this.handler = job?.name ?? undefined;
    this.data = job?.data ?? undefined;
    this.duration = job?.opts?.delay ?? undefined;
    this.timestamp = job?.opts?.timestamp ?? undefined;
    this.id = job?.opts?.id ?? undefined;
    this.remaining = job ? (job?.opts?.timestamp + job?.opts?.delay) - Date.now() : undefined;
  }

  /**
   * Cancel an event
   * @returns {Promise<TimerJob>}
   */
  async cancel () {
    return await this.client.utility.timer.cancel(this.id);
  }

  /**
   * Change the time event time
   * @param {Number} duration
   * @returns {Promise<TimerJob>}
   */
  async delay (duration) {
    return await this.client.utility.timer.delay(this.id, duration);
  }
}

export default TimerJob;
