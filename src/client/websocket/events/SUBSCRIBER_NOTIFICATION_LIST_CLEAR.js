import BaseEvent from './BaseEvent.js';

export default class UserNotificationListClearEvent extends BaseEvent {
  constructor (client) {
    super(client, 'user notification list clear');
  }

  async process () {
    this.client.me.notificationStore.user.clear(); // Clear currently fetched notification list
    this.client.notification.user.store.clear(); // Clear any fetched notification data

    return this.client.emit('userNotificationsCleared');
  }
}
