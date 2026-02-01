import BaseEntity from './BaseEntity.js';

export default class UserFrame extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.frameId = entity.frameId;
  }

  async fetch () {
    return this.client.frame.fetch(this.frameId);
  }
}
