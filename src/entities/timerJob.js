export default class TimerJob {
  constructor (client, job) {
    this.client = client;

    this.handler = job?.name;
    this.data = job?.data;
    this.delay = job?.opts?.delay;
    this.timestamp = job?.opts?.timestamp;
    this.id = job?.opts?.id;
    this.remaining = job
      ? (job?.opts?.timestamp + job?.opts?.delay) - Date.now()
      : undefined;
  }

  async cancel () {
    return await this.client.utility.timer.cancel(this.id);
  }

  async delay (delay) {
    return await this.client.utility.timer.delay(this.id, delay);
  }
}
