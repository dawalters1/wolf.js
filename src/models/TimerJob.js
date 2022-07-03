
class TimerJob {
  constructor (client, job) {
    this.client = client;
    this.handler = job?.name ?? undefined;
    this.data = job.data ?? undefined;
    this.delay = job.delay ?? undefined;
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

module.exports = TimerJob;
