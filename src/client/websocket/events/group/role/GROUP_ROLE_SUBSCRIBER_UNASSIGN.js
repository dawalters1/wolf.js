import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const cached = client.channel.channels.find((channel) => channel.id === body.id);

  if (!cached) { return false; }

  if (cached.roles._requestedRoles) {
    const role = cached.roles._roles.find((role) => role.roleId === body.additionalInfo.roleId);

    role.subscriberIdList = role.subscriberIdList.filter((subscriberId) => subscriberId !== body.additionalInfo.subscriberId);
  }

  if (cached.roles._requestedMembers) {
    cached.roles._members = cached.roles._members.filter((member) => member.roleId !== body.additionalInfo.roleId && member.subscriberId !== body.additionalInfo.subscriberId);
  }

  return client.emit(
    Event.CHANNEL_ROLE_SUBSCRIBER_UNASSIGN,
    cached,
    new models.ChannelRoleMember(
      client,
      body.additionalInfo,
      body.id
    )
  );
};
