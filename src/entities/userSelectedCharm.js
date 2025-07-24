import BaseEntity from './baseEntity.js';

export class UserSelectedCharm extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.charmId = entity.charmId;
    this.position = entity.position;
  }

  /** @internal */
  patch (entity) {
    this.charmId = entity.charmId;
    this.position = entity.position;
    return this;
  }
}

export default UserSelectedCharm;
