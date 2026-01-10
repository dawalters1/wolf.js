import BaseEvent from './BaseEvent.js';
import ChannelMember from '../../../entities/ChannelMember.js';
import ChannelMemberCapability from '../../../constants/ChannelMemberCapability.js';
import ChannelOwner from '../../../entities/ChannelOwner.js';

export default class GroupMemberDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group member delete');
  }

  async process (data) {
    if (data.subscriberId === this.client.me.id) {
      const channel = await this.client.channel.fetch(data.groupId);

      channel.capabilities = data.capabilities;
      channel.isMember = data.capabilities !== ChannelMemberCapability.BANNED;
    }

    const channel = this.client.channel.store.get((item) => item.id === data.groupId);

    if (channel === null) { return; }

    if (data.capabilities === ChannelMemberCapability.OWNER) {
      const user = await this.client.user.fetch(data.subscriberId);

      channel.owner = new ChannelOwner(this.client, user);
    }

    const channelMember = channel.memberStore.get((item) => item.id === data.subscriberId);
    const oldChannelMember = channelMember?.clone() ?? null;

    if (channelMember === null) { return; }

    channelMember.onCapabilityUpdate(data.capabilities);

    return this.client.emit(
      'channelMemberUpdated',
      channel,
      oldChannelMember,
      channelMember
    );
  }
}
