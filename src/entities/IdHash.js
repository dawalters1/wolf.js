import BaseEntity from './BaseEntity.js';

export default class IdHash extends BaseEntity {
  constructor (client, entity, isChannel = false) {
    super(client);
    this.id = entity.id;
    this.hash = entity.hash;
    this.isChannel = isChannel;
  }

  async fetch () {
    return this.client[this.isChannel
      ? 'channel'
      : 'user'].fetch(this.id);
  }
}
