import BaseEvent from './baseEvent';
import Contact from '../../../structures/contact';
import WOLF from '../../WOLF';

interface ServerSubscriberBlockAdd {
    id: number;
    targetId: number;
}

class SubscriberBlockAddEvent extends BaseEvent<ServerSubscriberBlockAdd> {
  constructor (client: WOLF) {
    super(client, 'subscriber block add');
  }

  async process (data: ServerSubscriberBlockAdd) {
    const user = await this.client.user.getById(data.targetId);

    if (user === null) { return; }

    this.client.emit(
      'blockAdd',
      this.client.contact.cache.set(new Contact(this.client, user))
    );
  }
}

export default SubscriberBlockAddEvent;
