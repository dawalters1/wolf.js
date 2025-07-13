import BaseEvent from './baseEvent.js';

const body = {
  id: 0,
  additionalInfo: {
    hash: ''
  }
};

class SubscriberFollowDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber follow delete');
  }

  async process (data) {
    const wasDeleted = this.client.me._follow.following.list.delete(data.id);

    if (!wasDeleted) { return; }

    return this.client.emit(
      'userFollowDelete',
      data.id
    );
  }
}

export default SubscriberFollowDeleteEvent;
