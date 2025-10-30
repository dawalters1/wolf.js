
import BaseEvent from './baseEvent.js';
import ChannelMemberCapability from '../../../constants/ChannelMemberCapability.js';

class GroupMemberDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group member delete');
  }

  async process (data) {
    if (data.subscriberId === this.client.me.id) {
      const channel = await this.client.channel.getById(data.groupId);

      channel.isMember = false;
      channel.capabilities = ChannelMemberCapability.NONE;
      channel.memberStore.clear();

      return this.client.emit('leftChannel', channel);
    }

    const channel = this.client.channel.store.get(data.groupId);

    if (channel === null) { return; }

    const member = channel.memberStore.get(data.subscriberId);

    if (member === null) { return; };

    channel.memberStore.delete((member) => member.id === data.subscriberId);

    return this.client.emit(
      'channelMemberDelete',
      channel,
      member
    );
  }
}

export default GroupMemberDeleteEvent;
