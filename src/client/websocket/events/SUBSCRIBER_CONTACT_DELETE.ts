import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

interface ServerSubscriberContactDelete {
    id: number;
    targetId: number;
}

class SubscriberContactDeleteEvent extends BaseEvent<ServerSubscriberContactDelete> {
  constructor (client: WOLF) {
    super(client, 'subscriber contact delete');
  }

  async process (data: ServerSubscriberContactDelete) {
    const wasDeleted = this.client.contact.cache.delete(data.targetId);

    if (wasDeleted === false) { return; }

    this.client.emit(
      'contactDelete',
      data.targetId
    );
  }
}

export default SubscriberContactDeleteEvent;
