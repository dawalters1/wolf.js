import BaseEvent from './baseEvent';
import ChannelRoleUser from '../../../structures/channelRoleUser';
import WOLF from '../../WOLF';

export interface ServerGroupRoleSubscriberAssign {
  id: number;
  additionalInfo: {
    roleId: number,
    subscriberId: number
  }
}

class GroupRoleSubscriberAssignEvent extends BaseEvent<ServerGroupRoleSubscriberAssign> {
  constructor (client: WOLF) {
    super(client, 'group role subscriber assign');
  }

  async process (data: ServerGroupRoleSubscriberAssign) {
    const channel = this.client.channel.cache.get(data.id);

    if (channel === null) { return; }

    const [role, user] = [
      channel.roles.summaries.get(data.additionalInfo.roleId),
      channel.roles.users.get(data.additionalInfo.subscriberId)
    ];

    role?.userIdList?.add(data.additionalInfo.subscriberId);

    this.client.emit(
      'channelRoleUserAssign',
      channel.roles.users.set(
        user
          ? user.patch(data)
          : new ChannelRoleUser(this.client, data)
      )
    );
  }
}

export default GroupRoleSubscriberAssignEvent;
