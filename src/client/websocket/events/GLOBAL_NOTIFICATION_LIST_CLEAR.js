import BaseEvent from './baseEvent.js';

class GlobalNotificationListClear extends BaseEvent {
  constructor (client) {
    super(client, 'global notification list clear');
  }

  async process () {
    if (this.client.me.notificationStore.global.store.size === 0) { return; }

    const notificationIds = this.client.me.notificationStore.global.values()
      .map((notification) => notification.id);

    this.client.notification.global.store.delete((notification) => notificationIds.includes(notification.id));

    this.client.emit('globalNotificationClear');
  }
}

export default GlobalNotificationListClear;
