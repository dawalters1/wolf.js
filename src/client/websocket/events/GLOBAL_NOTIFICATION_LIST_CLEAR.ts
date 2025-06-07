import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

class SubscriberNotificationListClear extends BaseEvent {
  constructor (client: WOLF) {
    super(client, 'subscriber notification list clear');
  }

  async process () {
    if (this.client.notification.user.cache.size() === 0) { return; }

    this.client.notification.user.cache.clear();

    this.client.emit('userNotificationClear');
  }
}

export default SubscriberNotificationListClear;
