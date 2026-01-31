import BaseEvent from './BaseEvent.js';

export default class GlobalNotificationDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'global notification delete');
  }

  async process (data) {
    const notification = this.client.notificationStore.global.get((item) => item.id === data.id);

    this.client.notificationStore.global.delete((item) => item.id === data.id);
    this.client.notification.global.delete((item) => item.id === data.id);

    if (notification === null) { return; }

    return this.client.emit(
      'globalNotificationDeleted',
      notification
    );
  }
}
