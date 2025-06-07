import BaseEvent from './baseEvent';
import { ServerUserPresence } from '../../../structures/userPresence';
import WOLF from '../../WOLF';

class PresenceUpdateEvent extends BaseEvent<Partial<ServerUserPresence>> {
  constructor (client: WOLF) {
    super(client, 'presence update');
  }

  async process (data: Partial<ServerUserPresence>): Promise<void> {

  }
}

export default PresenceUpdateEvent;
