import BaseEvent from './baseEvent.js';

class SubscriberNotificationListDelete extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber notification list delete');
  }

  async process (data) {
    const wasDeleted = [
      this.client.me && this.client.me._notifications.user.delete(data.id),
      this.client.notification.user.cache.delete(data.id)
    ].some(Boolean);

    if (wasDeleted === false) { return; }

    this.client.emit('userNotificationDelete', data.id);
  }
}

export default SubscriberNotificationListDelete;
