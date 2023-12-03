import { Event, ServerEvent } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GroupRoleSubscriberUnassign extends Base {
  constructor (client) {
    super(client, ServerEvent.GROUP_ROLE_SUBSCRIBER_UNASSIGN);
  }

  async process (body) {
    const cached = this.client.channel.channels.find((channel) => channel.id === body.id);

    if (!cached) { return false; }

    if (cached.roles._requestedRoles) {
      const role = cached.roles._roles.find((role) => role.roleId === body.additionalInfo.roleId);

      role.subscriberIdList = role.subscriberIdList.filter((subscriberId) => subscriberId !== body.additionalInfo.subscriberId);
    }

    if (cached.roles._requestedMembers) {
      cached.roles._members = cached.roles._members.filter((member) => member.roleId !== body.additionalInfo.roleId && member.subscriberId !== body.additionalInfo.subscriberId);
    }

    return this.client.emit(
      Event.CHANNEL_ROLE_SUBSCRIBER_UNASSIGN,
      cached,
      new models.ChannelRoleMember(
        this.client,
        body.additionalInfo,
        body.id
      )
    );
  };
}
export default GroupRoleSubscriberUnassign;
