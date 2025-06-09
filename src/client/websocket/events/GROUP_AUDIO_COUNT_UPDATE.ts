import BaseEvent from './baseEvent';
import { ServerGroupAudioCount } from '../../../structures/channelAudioCount';
import WOLF from '../../WOLF';

export interface ServerGroupAudioCountUpdate extends ServerGroupAudioCount {}

class GroupAudioCountUpdateEvent extends BaseEvent<ServerGroupAudioCountUpdate> {
  constructor (client: WOLF) {
    super(client, 'group audio count update');
  }

  async process (data: ServerGroupAudioCountUpdate) {
    const channel = this.client.channel.cache.get(data.id);

    if (channel === null) { return; }

    if (channel.audioCount === null) { return; }

    const oldChannelAudioCount = channel.audioCount.clone();

    this.client.emit(
      'channelAudioCountUpdate',
      oldChannelAudioCount,
      channel.audioCount?.patch(data)
    );
  }
}

export default GroupAudioCountUpdateEvent;
