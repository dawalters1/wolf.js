import BaseEvent from './baseEvent.js';

class GroupUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group update');
  }

  async process (data) {
    const oldChannel = this.client.channel.store.get(data.id)?.clone() ?? null;

    if (oldChannel === null || oldChannel.hash === data.hash) { return; }

    const newChannel = await this.client.channel.getById(data.id, { forceNew: true });

    if (newChannel === null) { return; }

    this.client.emit(
      'channelProfileUpdate',
      oldChannel,
      newChannel
    );
  }
}

export default GroupUpdateEvent;
