import BaseEvent from './baseEvent.js';

class SubscriberBlockDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber block delete');
  }

  async process (data) {
    const wasDeleted = this.client.contact.blocked.cache.delete(data.targetId);

    if (wasDeleted === false) { return; }

    this.client.emit(
      'blockDelete',
      data.targetId
    );
  }
}

export default SubscriberBlockDeleteEvent;
