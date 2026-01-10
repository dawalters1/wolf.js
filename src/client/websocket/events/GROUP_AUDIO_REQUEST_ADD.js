import BaseEvent from './BaseEvent.js';
import ChannelAudioSlotRquest from '../../../entities/ChannelAudioSlotRquest.js';

export default class GroupAudioRequestAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio request add');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.id);

    if (channel === null) { return; }

    const channelAudioSlotRquest = new ChannelAudioSlotRquest(this.client, data);

    channel.audioSlotRequestStore.set(channelAudioSlotRquest);

    return this.client.emit(
      'channelAudioSlotRequested',
      channelAudioSlotRquest
    );
  }
}
