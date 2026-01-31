import BaseEvent from './BaseEvent.js';
import Notification from '../../../entities/Notification.js';

export default class GlobalNotificationListAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'global notification list add');
  }

  async process (data) {
    const notification = this.client.me.notificationStore.global.add(
      new Notification(this.client, data)
    );

    return this.client.emit(
      'globalNotificationAdded',
      notification
    );
  }
}
