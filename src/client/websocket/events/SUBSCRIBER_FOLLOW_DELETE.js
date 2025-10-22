import BaseEvent from './baseEvent.js';

class SubscriberFollowDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber follow delete');
  }

  async process (data) {
    const wasDeleted = this.client.me.followStore.following.list.delete(data.id);

    if (!wasDeleted) { return; }

    return this.client.emit(
      'userFollowDelete',
      data.id
    );
  }
}

export default SubscriberFollowDeleteEvent;
