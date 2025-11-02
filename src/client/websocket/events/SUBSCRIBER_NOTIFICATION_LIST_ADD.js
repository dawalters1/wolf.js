import BaseEvent from './baseEvent.js';
import Notification from '../../../entities/notification.js';

class SubscriberNotificationListAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber notification list add');
  }

  async process (data) {
    this.client.emit(
      'userNotificationAdd',
      this.client.me.notificationStore.user.set(
        new Notification(
          this.client,
          data
        )
      )
    );
  }
}

export default SubscriberNotificationListAddEvent;
