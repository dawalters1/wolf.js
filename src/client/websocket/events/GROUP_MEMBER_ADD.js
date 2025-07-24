
import BaseEvent from './baseEvent.js';
import ChannelMember from '../../../entities/channelMember.js';

class GroupMemberAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group member add');
  }

  async process (data) {
    if (data.subscriberId === this.client.me.id) {
      const channel = await this.client.channel.getById(data.groupId);

      channel.isMember = true;
      channel.capabilities = data.capabilities;

      return this.client.emit('joinedChannel', channel);
    }

    const channel = this.client.channel.cache.get(data.groupId);

    if (channel === null) { return; }

    return this.client.emit(
      'channelMemberAdd',
      channel,
      channel._members.set(
        new ChannelMember(
          this.client,
          {
            ...data,
            hash: (await this.client.user.getById(data.subscriberId)).hash
          }
        )
      )
    );
  }
}

export default GroupMemberAddEvent;
