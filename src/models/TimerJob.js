import { Base } from './Base.js';

class TimerJob extends Base {
  constructor (client, job) {
    super(client);
    this.handler = job?.name ?? undefined;
    this.data = job.data ?? undefined;
    this.duration = job.delay ?? undefined;
    this.timestamp = job.timestamp ?? undefined;
    this.id = job?.id ?? undefined;
    this.remaining = (job.timestamp + job.delay) - Date.now();
  }

  async cancel () {
    return await this.client.utility.timer.cancel(this.id);
  }

  async delay (duration) {
    return await this.client.utility.timer.delay(this.id, duration);
  }
}

export { TimerJob };
