import BaseEntity from './BaseEntity.js';

export default class MessageEdited extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.userId = entity.subscriberId;
    this.timestamp = entity.timestamp;
  }

  async user () {
    return this.client.user.fetch(this.userId);
  }
}
