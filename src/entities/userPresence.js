import BaseEntity from './baseEntity.js';

export class UserPresence extends BaseEntity {
  constructor (client, entity, subscribed = false) {
    super(client);

    if ('subscriberId' in entity) {
      this.userId = entity.subscriberId;
      this.state = entity.state;
      this.device = entity.device;
      this.lastActive = entity.lastActive;
    } else {
      this.userId = entity.id;
      this.state = entity.onlineState;
      this.device = entity.deviceType;
      this.lastActive = null;
    }

    this.subscribed = subscribed;
  }
}

export default UserPresence;
