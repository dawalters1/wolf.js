import BaseEvent from './baseEvent.js';
import ChannelAudioSlotRequest from '../../../entities/channelAudioSlotRequest.js';

class GroupAudioRequestAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio request add');
  }

  async process (data) {
    const channel = this.client.channel.cache.get(data.groupId);

    if (channel === null) { return; }

    this.client.emit(
      'channelAudioSlotRequestAdd',
      channel._audioSlotRequests.set(
        new ChannelAudioSlotRequest(
          this.client,
          data
        )
      )
    );
  }
}

export default GroupAudioRequestAddEvent;
