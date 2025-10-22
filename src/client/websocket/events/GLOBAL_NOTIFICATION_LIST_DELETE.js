// * eslint-disable @typescript-eslint/no-non-null-assertion * /
import BaseEvent from './baseEvent.js';

class GlobalNotificationListDelete extends BaseEvent {
  constructor (client) {
    super(client, 'global notification list delete');
  }

  async process (data) {
    const wasDeleted = [
      this.client.me && this.client.me.notificationStore.global.delete(data.id),
      this.client.notification.global.store.delete(data.id)
    ].some(Boolean);

    if (wasDeleted === false) { return; }

    this.client.emit('globalNotificationDelete', data.id);
  }
}

export default GlobalNotificationListDelete;
