import BaseEvent from './BaseEvent.js';
import Notification from '../../../entities/Notification.js';

export default class UserNotificationListAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber notification list add');
  }

  async process (data) {
    const notification = this.client.me.notificationStore.user.add(
      new Notification(this.client, data)
    );

    return this.client.emit(
      'userNotificationAdded',
      notification
    );
  }
}
