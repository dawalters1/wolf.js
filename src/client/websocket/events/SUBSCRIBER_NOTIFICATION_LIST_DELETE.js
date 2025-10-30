import BaseEvent from './baseEvent.js';

class SubscriberNotificationListDelete extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber notification list delete');
  }

  async process (data) {
    const wasDeleted = [
      this.client.me && this.client.me.notificationStore.user.delete((notification) => notification.id === data.id),
      this.client.notification.user.store.delete((notification) => notification.id === data.id)
    ].some(Boolean);

    if (wasDeleted === false) { return; }

    this.client.emit('userNotificationDelete', data.id);
  }
}

export default SubscriberNotificationListDelete;
