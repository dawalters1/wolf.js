import BaseEntity from './baseEntity.js';

export class UserSelectedCharm extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.charmId = entity.charmId;
    this.position = entity.position;
  }
}

export default UserSelectedCharm;
