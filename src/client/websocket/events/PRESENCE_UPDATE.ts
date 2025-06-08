import BaseEvent from './baseEvent';
import { DeviceType, UserPresence } from '../../../constants';
import WOLF from '../../WOLF';

export interface ServerUserPresenceUpdate {
  id: number;
  deviceType: DeviceType
  onlineState: UserPresence
}

class PresenceUpdateEvent extends BaseEvent<ServerUserPresenceUpdate> {
  constructor (client: WOLF) {
    super(client, 'presence update');
  }

  async process (data: ServerUserPresenceUpdate): Promise<void> {
    const user = this.client.user.cache.get(data.id);

    if (user === null) { return; };

    this.client.emit(
      'userPresenceUpdate',
      user.presence.patch(data)
    );
  }
}

export default PresenceUpdateEvent;
