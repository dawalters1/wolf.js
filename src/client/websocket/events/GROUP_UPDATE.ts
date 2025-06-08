import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

interface ServerGroupUpdate {
    id: number;
    hash: string;
}

class GroupUpdateEvent extends BaseEvent<ServerGroupUpdate> {
  constructor (client: WOLF) {
    super(client, 'group update');
  }

  async process (data: ServerGroupUpdate) {
    const oldChannel = this.client.channel.cache.get(data.id)?.clone() ?? null;

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
