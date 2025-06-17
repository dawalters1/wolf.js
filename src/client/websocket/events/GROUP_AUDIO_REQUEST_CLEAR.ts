import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

interface ServerGroupAudioRequestDelete {
    groupId: number;
}

class GroupAudioRequestAddEvent extends BaseEvent<ServerGroupAudioRequestDelete> {
  constructor (client: WOLF) {
    super(client, 'group audio request clear');
  }

  async process (data: ServerGroupAudioRequestDelete) {
    const channel = this.client.channel.cache.get(data.groupId);

    if (channel === null) { return; };

    if (channel._audioSlotRequests.size() === 0) { return; }

    channel._audioSlotRequests.clear();

    this.client.emit(
      'channelAudioSlotRequestClear'
    );
  }
}

export default GroupAudioRequestAddEvent;
