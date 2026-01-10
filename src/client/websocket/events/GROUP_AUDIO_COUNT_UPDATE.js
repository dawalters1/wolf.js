import BaseEvent from './BaseEvent.js';
import ChannelAudioCount from '../../../entities/ChannelAudioCount.js';

export default class GroupAudioCountUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio count update');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.id);

    if (channel === null) { return; }

    const oldChannelAudioCount = channel.audioCount?.clone() ?? null;

    channel.audioCount = channel.audioCount?.patch(data) ?? new ChannelAudioCount(this.client, data);

    return this.client.emit(
      'channelAudioCountUpdated',
      channel,
      oldChannelAudioCount,
      channel.audioCount
    );
  }
}
