import BaseEvent from './BaseEvent.js';

export default class GroupAudioRequestDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio request delete');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.id);

    if (channel === null) { return; }

    const channelAudioSlotRquest = channel.audioSlotRequestStore.get((item) => item.id === data.id);

    if (channelAudioSlotRquest === null) { return; }

    channel.audioSlotRequestStore.delete((item) => item.id === data.id);

    return this.client.emit(
      channelAudioSlotRquest.expiresAt.getTime() <= Date.now()
        ? 'channelAudioSlotRequestExpired'
        : 'channelAudioSlotRequestDeleted',
      channel,
      channelAudioSlotRquest
    );
  }
}
