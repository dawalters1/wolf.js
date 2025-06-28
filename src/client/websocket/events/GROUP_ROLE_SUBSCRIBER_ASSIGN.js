import BaseEvent from './baseEvent.js';
import ChannelRoleUser from '../../../entities/channelRoleUser.js';

class GroupRoleSubscriberAssignEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group role subscriber assign');
  }

  async process (data) {
    const channel = this.client.channel.cache.get(data.id);

    if (channel === null) { return; }

    const [role, user] = [
      channel._roles.summaries.get(data.additionalInfo.roleId),
      channel._roles.users.get(data.additionalInfo.subscriberId)
    ];

    role?.userIdList?.add(data.additionalInfo.subscriberId);

    this.client.emit(
      'channelRoleUserAssign',
      channel._roles.users.set(
        user
          ? user.patch(data)
          : new ChannelRoleUser(this.client, data)
      )
    );
  }
}

export default GroupRoleSubscriberAssignEvent;
