import BaseEvent from './BaseEvent.js';

export default class SubscriberContactDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber contact delete');
  }

  async process (data) {
    const contact = this.client.contact.store.get((item) => item.id === data.targetId);

    if (contact === null) { return; }

    this.client.contact.store.delete((item) => item.id === data.targetId);

    this.client.emit(
      'userDeleted',
      contact
    );
  }
}
