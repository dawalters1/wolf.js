import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

interface ServerGroupAudioRequestDelete {
    groupId: number;
    subscriberId: number;
}

class GroupAudioRequestAddEvent extends BaseEvent<ServerGroupAudioRequestDelete> {
  constructor (client: WOLF) {
    super(client, 'group audio request delete');
  }

  async process (data: ServerGroupAudioRequestDelete) {
    const channel = this.client.channel.cache.get(data.groupId);

    if (channel === null) { return; };

    const wasDeleted = channel.audioSlotRequests.delete(data.subscriberId);

    if (wasDeleted === false) { return; }

    this.client.emit(
      'channelAudioSlotRequestDelete',
      data.subscriberId
    );
  }
}

export default GroupAudioRequestAddEvent;
