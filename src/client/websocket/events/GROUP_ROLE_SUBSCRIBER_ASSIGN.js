import BaseEvent from './BaseEvent.js';
import ChannelRoleUser from '../../../entities/ChannelRoleUser.js';

export default class GroupRoleSubscriberAssignEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group role subscriber assign');
  }

  async process (data) {
    const [channel, user] = [
      this.client.channel.store.get((item) => item.id === data.id),
      this.client.user.store.get((item) => item.id === data.additionalInfo.subscriberId)
    ];

    user.roleStore?.clear();

    if (channel === null) { return; }

    const channelRole = new ChannelRoleUser(this.client, data);

    channel.roleStore.roles.get((item) => item.roleId === channelRole.roleId)?.userIdList?.add(channelRole.userId);
    channel.roleStore.users.set(channelRole);

    return this.client.emit(
      'channelRoleAssigned',
      channel,
      user,
      channelRole
    );
  }
}
