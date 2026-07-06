import BaseEvent from './BaseEvent.js';

export default class GlobalNotificationDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'global notification delete');
  }

  async process (data) {
    const notification = this.client.notificationStore.global.get((item) => item.id === data.id);

    this.client.notificationStore.global.delete((item) => item.id === data.id);
    this.client.notification.global.delete((item) => item.id === data.id);

    if (notification === null) { return this.client.log.debug(`[GlobalNotification]: Global notification was deleted, but wasn't in cache [notificationId:${data.id}]`); }

    this.client.log.debug(`[GlobalNotification]: Global notification was deleted, and removed from cache [notificationId:${data.id}]`);

    return this.client.emit(
      'globalNotificationDeleted',
      notification
    );
  }
}
