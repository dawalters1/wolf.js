import BaseEvent from './baseEvent';
import Notification from '../../../structures/notification';
import WOLF from '../../WOLF';

interface ServerSubscriberNotificationListAdd {
    id: number
    additionalInfo: {
        eTag: string,
        createdAt: Date
    }
}

class SubscriberNotificationListAddEvent extends BaseEvent<ServerSubscriberNotificationListAdd> {
  constructor (client: WOLF) {
    super(client, 'subscriber notification list add');
  }

  async process (data: ServerSubscriberNotificationListAdd) {
    data.additionalInfo.createdAt = new Date();

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
