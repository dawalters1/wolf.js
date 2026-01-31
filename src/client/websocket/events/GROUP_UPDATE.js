import BaseEvent from './BaseEvent.js';

export default class GroupUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group update');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.id)?.clone() ?? null;

    if (channel === null || channel.hash === data.hash) { return; }

    const newChannel = await this.client.channel.fetch(data.id, { forceNew: true });

    if (newChannel === null) {
      return this.client.emit(
        'channelDeleted',
        channel
      );
    }

    return this.client.emit(
      'channelUpdated',
      channel,
      newChannel
    );
  }
}
