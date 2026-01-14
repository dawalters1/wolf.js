import BaseEvent from './BaseEvent.js';

export default class GlobalNotificationListClearEvent extends BaseEvent {
  constructor (client) {
    super(client, 'global notification list clear');
  }

  async process () {
    this.client.me.notificationStore.global.clear(); // Clear currently fetched notification list
    this.client.notification.global.store.clear(); // Clear any fetched notification data

    return this.client.emit('globalNotificationsCleared');
  }
}
