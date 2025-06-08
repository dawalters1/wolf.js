import BaseEntity from './baseEntity';
import { DeviceType, UserPresence as UserPresenceType } from '../constants';
import { ServerUser } from './user';
import { ServerUserPresenceUpdate } from '../client/websocket/events/PRESENCE_UPDATE';
import WOLF from '../client/WOLF';

export interface ServerUserPresence {
    subscriberId: number;
    state: UserPresenceType;
    device: DeviceType;
    lastActive: number | null;
}

export class UserPresence extends BaseEntity {
  userId: number;
  state: UserPresenceType;
  device: DeviceType;
  lastActive: number | null;
  subscribed: boolean = false;

  constructor (client: WOLF, data: ServerUserPresence | ServerUser) {
    super(client);

    if ('subscriberId' in data) {
      this.userId = data.subscriberId;
      this.state = data.state;
      this.device = data.device;
      this.lastActive = data.lastActive;
    } else {
      this.userId = data.id;
      this.state = data.onlineState;
      this.device = data.deviceType;
      this.lastActive = null;
    }
  }

  patch (entity: ServerUserPresence | ServerUser | ServerUserPresenceUpdate): this {
    if ('subscriberId' in entity) {
      this.userId = entity.subscriberId;
      this.state = entity.state;
      this.device = entity.device;
      this.lastActive = entity.lastActive;
    } else {
      this.userId = entity.id;
      this.state = entity.onlineState;
      this.device = entity.deviceType;
      this.lastActive = this.lastActive ?? null;
    }
    return this;
  }
}

export default UserPresence;
