import BaseEvent from './BaseEvent.js';
import ChannelMember from '../../../entities/ChannelMember.js';

export default class GroupMemberDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group member delete');
  }

  async process (data) {
    if (data.subscriberId === this.client.me.id) {
      const channel = await this.client.channel.fetch(data.groupId);

      channel.isMember = false;
      channel.capabilities = data.capabilities;
      channel.memberStore.clear();

      return this.client.emit(
        'leftChannel',
        channel
      );
    }

    const channel = this.client.channel.store.get((item) => item.id === data.groupId);

    if (channel === null) { return; }

    const channelMember = channel.memberStore.get((item) => item.id === data.subscriberId);

    if (channelMember === null) { return; }

    channel.memberStore.delete((item) => item.id === data.subscriberId);

    return this.client.emit(
      'channelMemberLeft',
      channel,
      channelMember
    );
  }
}
