import BaseEntity from './baseEntity.js';

export class UserFollow extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.userId = entity.subscriberId;
    this.notification = entity.notification;
    this.hash = entity.hash;
  }

  /** @internal */
  patch (entity) {
    this.userId = entity.subscriberId;
    this.notification = entity.notification;
    this.hash = entity.hash;
  }
}

export default UserFollow;
