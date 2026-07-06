import BaseEvent from './BaseEvent.js';
import ChannelAudioCount from '../../../entities/ChannelAudioCount.js';

export default class GroupAudioCountUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio count update');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.id);

    if (channel === null) { return this.client.log.debug(`[GroupAudioCountUpdated]: Group audio count updated in channel that was not cached [channelId:${data.id}]`); }

    const oldChannelAudioCount = channel.audioCount?.clone() ?? null;

    channel.audioCount = channel.audioCount?.patch(data) ?? new ChannelAudioCount(this.client, data);

    this.client.log.debug(`[GroupAudioCountUpdated]: Group audio count updated [audioCount:${JSON.stringify(channel.audioCount)}]`);

    return this.client.emit(
      'channelAudioCountUpdated',
      channel,
      oldChannelAudioCount,
      channel.audioCount
    );
  }
}
