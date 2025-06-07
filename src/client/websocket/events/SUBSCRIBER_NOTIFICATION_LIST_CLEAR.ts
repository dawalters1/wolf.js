import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

class GlobalNotificationListClear extends BaseEvent {
  constructor (client: WOLF) {
    super(client, 'global notification list clear');
  }

  async process () {
    if (this.client.notification.global.cache.size() === 0) { return; }

    this.client.notification.global.cache.clear();

    this.client.emit('globalNotificationClear');
  }
}

export default GlobalNotificationListClear;
