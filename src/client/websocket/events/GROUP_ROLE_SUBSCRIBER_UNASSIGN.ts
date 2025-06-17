import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

interface ServerGroupRoleSubscriberUnassign {
  id: number;
  additionalInfo: {
    roleId: number,
    subscriberId: number
  }
}

class GroupRoleSubscriberUnassignEvent extends BaseEvent<ServerGroupRoleSubscriberUnassign> {
  constructor (client: WOLF) {
    super(client, 'group role subscriber unassign');
  }

  async process (data: ServerGroupRoleSubscriberUnassign) {
    const channel = this.client.channel.cache.get(data.id);

    if (channel === null) { return; }

    const role = channel._roles.summaries.get(data.additionalInfo.roleId);

    role?.userIdList?.delete(data.additionalInfo.subscriberId);

    const wasDeleted = channel._roles.users.delete(data.additionalInfo.subscriberId);

    if (wasDeleted === false) { return; }

    this.client.emit(
      'channelRoleUserUnassign',
      data.additionalInfo.subscriberId,
      data.additionalInfo.roleId
    );
  }
}

export default GroupRoleSubscriberUnassignEvent;
