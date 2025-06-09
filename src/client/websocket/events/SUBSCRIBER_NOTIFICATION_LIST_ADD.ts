import BaseEvent from './baseEvent';
import Notification, { ServerNotification } from '../../../structures/notification';
import WOLF from '../../WOLF';

interface ServerSubscriberNotificationListAdd extends ServerNotification {}

class SubscriberNotificationListAddEvent extends BaseEvent<ServerSubscriberNotificationListAdd> {
  constructor (client: WOLF) {
    super(client, 'subscriber notification list add');
  }

  async process (data: ServerSubscriberNotificationListAdd) {
    this.client.emit(
      'userNotificationAdd',

      this.client.me.notificationsUser.set(
        new Notification(
          this.client,
          data
        )
      )
    );
  }
}

export default SubscriberNotificationListAddEvent;
