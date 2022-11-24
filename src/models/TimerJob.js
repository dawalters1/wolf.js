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

  async cancel () {
    return await this.client.utility.timer.cancel(this.id);
  }

  async delay (duration) {
    return await this.client.utility.timer.delay(this.id, duration);
  }

  toJSON () {
    return {
      handler: this.handler,
      data: this.data,
      duration: this.duration,
      timestamp: this.timestamp,
      id: this.id,
      remaining: this.remaining
    };
  }
}

export default TimerJob;
