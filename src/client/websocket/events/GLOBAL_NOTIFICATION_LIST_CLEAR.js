import BaseEvent from './baseEvent.js';

class SubscriberNotificationListClear extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber notification list clear');
  }

  async process () {
    if (this.client.notification.user.store.size() === 0) { return; }

    this.client.notification.user.store.clear();

    this.client.emit('userNotificationClear');
  }
}

export default SubscriberNotificationListClear;
