import BaseEvent from './baseEvent.js';
import Contact from '../../../entities/contact.js';

class SubscriberBlockAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber block add');
  }

  async process (data) {
    const user = await this.client.user.getById(data.targetId);

    if (user === null) { return; }

    this.client.emit(
      'blockAdd',
      this.client.contact.store.set(new Contact(this.client, user))
    );
  }
}

export default SubscriberBlockAddEvent;
