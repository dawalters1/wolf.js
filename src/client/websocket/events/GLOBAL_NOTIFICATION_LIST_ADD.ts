import BaseEvent from './baseEvent';
import Notification from '../../../structures/notification';
import WOLF from '../../WOLF';

interface ServerGlobalNotificationListAdd {
    id: number
    additionalInfo: {
        eTag: string,
        createdAt: Date
    }
}

class GlobalNotificationListAddEvent extends BaseEvent<ServerGlobalNotificationListAdd> {
  constructor (client: WOLF) {
    super(client, 'global notification list add');
  }

  async process (data: ServerGlobalNotificationListAdd) {
    data.additionalInfo.createdAt = new Date();

    this.client.emit(
      'globalNotificationAdd',

      this.client.me.notificationsGlobal.set(
        new Notification(
          this.client,
          data
        )
      )
    );
  }
}

export default GlobalNotificationListAddEvent;
