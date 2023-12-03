import { Event, ServerEvent } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GroupRoleSubscriberAssign extends Base {
  constructor (client) {
    super(client, ServerEvent.GROUP_ROLE_SUBSCRIBER_ASSIGN);
  }

  async process (body) {
    const cached = this.client.channel.channels.find((channel) => channel.id === body.id);

    if (!cached) { return false; }

    if (cached.roles._requestedRoles) {
      cached.roles._roles.find((role) => role.roleId === body.additionalInfo.roleId).subscriberIdList.push(body.additionalInfo.subscriberId);
    }

    if (cached.roles._requestedMembers) {
      cached.roles._members.push(new models.ChannelRoleMember(this.client, body.additionalInfo, body.id));
    }

    return this.client.emit(
      Event.CHANNEL_ROLE_SUBSCRIBER_ASSIGN,
      cached,
      new models.ChannelRoleMember(
        this.client,
        body.additionalInfo,
        body.id
      )
    );
  };
}
export default GroupRoleSubscriberAssign;
