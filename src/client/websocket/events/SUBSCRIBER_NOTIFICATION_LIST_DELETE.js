import BaseEvent from './BaseEvent.js';

export default class UserNotificationDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'user notification delete');
  }

  async process (data) {
    const notification = this.client.notificationStore.user.get((item) => item.id === data.id);

    this.client.notificationStore.user.delete((item) => item.id === data.id);
    this.client.notification.user.delete((item) => item.id === data.id);

    if (notification === null) { return; }

    return this.client.emit(
      'userNotificationDeleted',
      notification
    );
  }
}
