import BaseEntity from './BaseEntity.js';

export default class Ad extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.start = entity.index;
    this.end = this.start + entity[0].length;
    this.ad = entity[0];
    this.channelName = entity[1].trim();
  }

  async fetch (opts) {
    return this.client.channel.fetch(this.channelName, opts);
  }
}
