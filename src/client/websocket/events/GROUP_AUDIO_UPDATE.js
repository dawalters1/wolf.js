import BaseEvent from './baseEvent.js';
import ChannelAudioConfig from '../../../entities/channelAudioConfig.js';

class GroupAudioUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio update');
  }

  async process (data) {
    const channel = this.client.channel.cache.get(data.id);

    if (channel === null) { return; }
    const oldAudioConfig = channel.audioConfig?.clone();

    channel.audioConfig = channel.audioConfig?.patch(data) ?? new ChannelAudioConfig(this.client, data);

    this.client.emit(
      'channelAudioUpdate',
      data.sourceSubscriberId,
      oldAudioConfig,
      channel.audioConfig
    );
  }
}

export default GroupAudioUpdateEvent;
