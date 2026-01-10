import BaseEntity from './BaseEntity.js';

export default class UserPresence extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.userId = entity.id ?? entity.subscriberId;
    this.state = entity.onlineState ?? entity.state;
    this.device = entity.deviceType ?? entity.device;
    this.lastActive = entity.lastActive ?? null;
    this.subscribed = entity?.subscribed ?? false;
  }
}
