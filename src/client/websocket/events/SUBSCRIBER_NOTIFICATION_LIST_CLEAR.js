import BaseEvent from './baseEvent.js';

class SubscriberNotificationListClear extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber notification list clear');
  }

  async process () {
    if (this.client.me.notificationStore.user.store.size === 0) { return; }

    const notificationIds = this.client.me.notificationStore.user.values()
      .map((notification) => notification.id);

    this.client.notification.user.store.delete((notification) => notificationIds.includes(notification.id));

    this.client.emit('userNotificationClear');
  }
}

export default SubscriberNotificationListClear;
