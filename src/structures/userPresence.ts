import BaseEntity from './baseEntity';
import { DeviceType, UserPresence as UserPresenceType } from '../constants';
import { ServerUser } from './user';
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

  patch (presence: UserPresence | ServerUser) {
    if ('id' in presence) {
      this.userId = presence.id;
      this.state = presence.onlineState;
      this.device = presence.deviceType;
      this.lastActive = null;
    } else {
      this.userId = presence.userId;
      this.state = presence.state;
      this.device = presence.device;
      this.lastActive = presence.lastActive;
      this.subscribed = presence.subscribed;
    }

    return this;
  }
}

export default UserPresence;
