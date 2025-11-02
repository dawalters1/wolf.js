import BaseEvent from './baseEvent.js';
import Contact from '../../../entities/contact.js';

class SubscriberContactAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber contact add');
  }

  async process (data) {
    const user = await this.client.user.getById(data.targetId);

    if (user === null) { return; }

    this.client.emit(
      'contactAdd',
      this.client.contact.store.set(new Contact(this.client, user))
    );
  }
}

export default SubscriberContactAddEvent;
