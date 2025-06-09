/* eslint-disable @typescript-eslint/no-non-null-assertion */
import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

interface ServerGlobalNotificationListDelete {
  id: number;
}

class GlobalNotificationListDelete extends BaseEvent<ServerGlobalNotificationListDelete> {
  constructor (client: WOLF) {
    super(client, 'global notification list delete');
  }

  async process (data: ServerGlobalNotificationListDelete) {
    const wasDeleted = [
      this.client.me?.notificationsGlobal.delete(data.id),
      this.client.notification.global.cache.delete(data.id)
    ].some(Boolean);

    if (wasDeleted === false) { return; }

    this.client.emit('globalNotificationDelete', data.id!);
  }
}

export default GlobalNotificationListDelete;
