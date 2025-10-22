import BaseEvent from './baseEvent.js';
import ChannelRoleUser from '../../../entities/channelRoleUser.js';

class GroupRoleSubscriberAssignEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group role subscriber assign');
  }

  async process (data) {
    const channel = this.client.channel.store.get(data.id);

    if (channel === null) { return; }

    const channelRole = channel.roleStore.users.get(data.additionalInfo.roleId);
    const user = this.client.user.store.get(data.additionalInfo.subscriberId);

    if (user) { user.roleStore.clear(); }

    channelRole?.userIdList?.add(data.additionalInfo.subscriberId);

    this.client.emit(
      'channelRoleUserAssign',
      channel.roleStore.users.set(
        new ChannelRoleUser(this.client, data)
      )
    );
  }
}

export default GroupRoleSubscriberAssignEvent;
