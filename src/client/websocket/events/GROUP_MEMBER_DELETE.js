
import BaseEvent from './baseEvent.js';
import ChannelMemberCapability from '../../../constants/ChannelMemberCapability.js';

class GroupMemberAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group member delete');
  }

  async process (data) {
    if (data.subscriberId === this.client.me.id) {
      const channel = await this.client.channel.getById(data.groupId);

      channel.isMember = false;
      channel.capabilities = ChannelMemberCapability.NONE;
      channel._members.clear();

      return this.client.emit('leftChannel', channel);
    }

    const channel = this.client.channel.cache.get(data.groupId);

    if (channel === null) { return; }

    const member = channel._members.get(data.subscriberId);

    if (member === null) { return; };

    channel._members.delete(data.subscriberId);

    return this.client.emit(
      'channelMemberDelete',
      channel,
      member
    );
  }
}

export default GroupMemberAddEvent;
