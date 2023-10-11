import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const cached = client.channel.channels.find((channel) => channel.id === body.id);

  if (!cached) { return false; }

  if (cached.roles._requestedRoles) {
    cached.roles._roles.find((role) => role.roleId === body.additionalInfo.roleId).subscriberIdList.push(body.additionalInfo.subscriberId);
  }

  if (cached.roles._requestedMembers) {
    cached.roles._members.push(new models.ChannelRoleMember(client, body.additionalInfo, body.id));
  }

  return client.emit(
    Event.CHANNEL_ROLE_SUBSCRIBER_ASSIGN,
    cached,
    new models.ChannelRoleMember(
      client,
      body.additionalInfo,
      body.id
    )
  );
};
