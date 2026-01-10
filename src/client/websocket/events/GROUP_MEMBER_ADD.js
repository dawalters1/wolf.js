import BaseEvent from './BaseEvent.js';
import ChannelMember from '../../../entities/ChannelMember.js';

export default class GroupMemberAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group member add');
  }

  async process (data) {
    if (data.subscriberId === this.client.me.id) {
      const channel = await this.client.channel.fetch(data.groupId);

      channel.isMember = true;
      channel.capabilities = data.capabilities;

      return this.client.emit(
        'joinedChannel',
        channel
      );
    }

    const channel = this.client.channel.store.get((item) => item.id === data.groupId);

    if (channel === null) { return; }

    const { hash } = await this.client.user.fetch(data.subscriberId);
    const channelMember = new ChannelMember(
      {
        ...data,
        hash
      }
    );
    channel.memberStore.set(channelMember);

    return this.client.emit(
      'channelMemberJoined',
      channel,
      channelMember
    );
  }
}
