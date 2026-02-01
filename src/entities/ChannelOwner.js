import BaseEntity from './BaseEntity.js';

export default class ChannelOwner extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.hash = entity.hash;
  }

  async sendPrivateMessage (content, opts) {
    return await this.client.messaging.sendPrivateMessage(this.id, content, opts);
  }
}
