import BaseEvent from './baseEvent.js';

class SubscriberContactDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber contact delete');
  }

  async process (data) {
    const wasDeleted = this.client.contact.store.delete(data.targetId);

    if (wasDeleted === false) { return; }

    this.client.emit(
      'contactDelete',
      data.targetId
    );
  }
}

export default SubscriberContactDeleteEvent;
