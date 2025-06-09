/* eslint-disable @typescript-eslint/no-non-null-assertion */
import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

interface ServerSubscriberNotificationListDelete {
  id: number;
}

class SubscriberNotificationListDelete extends BaseEvent<ServerSubscriberNotificationListDelete> {
  constructor (client: WOLF) {
    super(client, 'subscriber notification list delete');
  }

  async process (data: ServerSubscriberNotificationListDelete) {
    const wasDeleted = [
      this.client.me?.notificationsUser.delete(data.id),
      this.client.notification.user.cache.delete(data.id)
    ].some(Boolean);

    if (wasDeleted === false) { return; }

    this.client.emit('userNotificationDelete', data.id!);
  }
}

export default SubscriberNotificationListDelete;
