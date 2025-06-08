import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

interface ServerSubscriberBlockDelete {
    id: number;
    targetId: number;
}

class SubscriberBlockDeleteEvent extends BaseEvent<ServerSubscriberBlockDelete> {
  constructor (client: WOLF) {
    super(client, 'subscriber block delete');
  }

  async process (data: ServerSubscriberBlockDelete) {
    this.client.contact.blocked.cache.delete(data.targetId);

    this.client.emit(
      'blockDelete',
      data.targetId
    );
  }
}

export default SubscriberBlockDeleteEvent;
