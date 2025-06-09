import BaseEvent from './baseEvent';
import Notification, { ServerNotification } from '../../../structures/notification';
import WOLF from '../../WOLF';

interface ServerGlobalNotificationListAdd extends ServerNotification {}

class GlobalNotificationListAddEvent extends BaseEvent<ServerGlobalNotificationListAdd> {
  constructor (client: WOLF) {
    super(client, 'global notification list add');
  }

  async process (data: ServerGlobalNotificationListAdd) {
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
