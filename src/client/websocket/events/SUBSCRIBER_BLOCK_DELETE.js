import BaseEvent from './BaseEvent.js';

export default class SubscriberBlockDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber block delete');
  }

  async process (data) {
    const contact = this.client.contact.blocked.store.get((item) => item.id === data.targetId);

    if (contact === null) { return; }

    this.client.contact.blocked.store.delete((item) => item.id === data.targetId);

    this.client.emit(
      'userUnblocked',
      contact
    );
  }
}
