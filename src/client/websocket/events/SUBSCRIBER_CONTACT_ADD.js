import BaseEvent from './BaseEvent.js';
import Contact from '../../../entities/contact.js';

export default class SubscriberContactAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber contact add');
  }

  async process (data) {
    const user = await this.client.user.fetch(data.targetId);

    if (user === null) { return; }

    const contact = new Contact(this.client, user);
    this.client.contact.store.set(contact);

    this.client.emit(
      'userAdded',
      contact
    );
  }
}
