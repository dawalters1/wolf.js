import BaseEvent from './baseEvent';
import ChannelAudioSlotRequest from '../../../structures/channelAudioSlotRequest';
import WOLF from '../../WOLF';

export interface ServerGroupAudioRequestAddEvent {
 groupId: number;
 subscriberId: number;
 expiresAt: number
}

class GroupAudioRequestAddEvent extends BaseEvent<ServerGroupAudioRequestAddEvent> {
  constructor (client: WOLF) {
    super(client, 'group audio request add');
  }

  async process (data: ServerGroupAudioRequestAddEvent) {
    const channel = this.client.channel.cache.get(data.groupId);

    if (channel === null) { return; };

    this.client.emit(
      'channelAudioSlotRequestAdd',
      channel.audioSlotRequests.set(
        new ChannelAudioSlotRequest(
          this.client,
          data
        )
      )
    );
  }
}

export default GroupAudioRequestAddEvent;
