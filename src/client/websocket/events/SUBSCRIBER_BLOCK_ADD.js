import BaseEvent from './BaseEvent.js';
import Contact from '../../../entities/contact.js';

export default class SubscriberBlockAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber block add');
  }

  async process (data) {
    const user = await this.client.user.fetch(data.targetId);

    if (user === null) { return; }

    const contact = new Contact(this.client, user);
    this.client.contact.blocked.store.set(contact);

    this.client.emit(
      'userBlocked',
      contact
    );
  }
}
