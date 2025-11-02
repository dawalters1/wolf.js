import BaseEvent from './baseEvent.js';
import Notification from '../../../entities/notification.js';

class GlobalNotificationListAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'global notification list add');
  }

  async process (data) {
    this.client.emit(
      'globalNotificationAdd',
      this.client.me.notificationStore.global.set(
        new Notification(
          this.client,
          data
        )
      )
    );
  }
}

export default GlobalNotificationListAddEvent;
