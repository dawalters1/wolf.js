
import BaseEvent from './baseEvent.js';
import ChannelMemberCapability from '../../../constants/ChannelMemberCapability.js';

class GroupMemberAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group member update');
  }

  async process (data) {
    if (data.subscriberId === this.client.me.id) {
      const channel = await this.client.channel.getById(data.groupId);
      channel.capabilities = data.capabilities;
      channel.isMember = data.capabilities !== ChannelMemberCapability.BANNED;
    }

    const channel = this.client.channel.cache.get(data.groupId);

    if (channel === null) { return; }

    const member = channel._members.get(data.subscriberId);

    if (member === null) { return; };
    const memberOld = member.clone();

    member._onCapabilityChange(data.capabilities);

    return this.client.emit(
      'channelMemberUpdate',
      channel,
      memberOld,
      member
    );
  }
}

export default GroupMemberAddEvent;
