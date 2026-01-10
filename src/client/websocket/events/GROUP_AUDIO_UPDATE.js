import BaseEvent from './BaseEvent.js';
import ChannelAudioConfig from '../../../entities/ChannelAudioConfig.js';

export default class GroupAudioUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio update');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.id);

    if (channel === null) { return; }

    const oldChannelAudioConfig = channel.audioConfig?.clone() ?? null;

    channel.audioConfig = channel.audioConfig?.patch(data) ?? new ChannelAudioConfig(this.client, data);

    return this.client.emit(
      'channelAudioCountUpdated',
      channel,
      oldChannelAudioConfig,
      channel.audioConfig
    );
  }
}
