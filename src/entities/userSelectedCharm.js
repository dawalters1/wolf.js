import BaseEntity from './BaseEntity.js';

export default class UserSelectedCharm extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.charmId = entity.charmId;
    this.position = entity.position;
  }
}
