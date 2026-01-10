import BaseEvent from './BaseEvent.js';
import ChannelAudioSlotRquest from '../../../entities/ChannelAudioSlotRquest.js';

export default class GroupAudioRequestClearEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio request clear');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.id);

    if (channel === null) { return; }

    channel.audioSlotRequestStore.clear();

    return this.client.emit(
      'channelAudioSlotRequestsCleared',
      channel
    );
  }
}
