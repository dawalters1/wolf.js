import BaseEntity from './baseEntity.js';

class CharmExpired extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.charmId = entity.charmId;
    this.userId = entity.subscriberId;
    this.sourceUserId = entity.sourceSubscriberId;
    this.expireTime = entity.expireTime ? new Date(entity.expireTime) : null;
  }
}

export default CharmExpired;
