import BaseEvent from './baseEvent';
import Contact from '../../../structures/contact';
import WOLF from '../../WOLF';

interface ServerSubscriberContactAdd {
    id: number;
    targetId: number;
}

class SubscriberContactAddEvent extends BaseEvent<ServerSubscriberContactAdd> {
  constructor (client: WOLF) {
    super(client, 'subscriber contact add');
  }

  async process (data: ServerSubscriberContactAdd) {
    const user = await this.client.user.getById(data.targetId);

    if (user === null) { return; }

    this.client.emit(
      'contactAdd',
      this.client.contact.cache.set(new Contact(this.client, user))
    );
  }
}

export default SubscriberContactAddEvent;
