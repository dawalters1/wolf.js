import BaseHelper from '../BaseHelper.js';
import ChannelRole from '../../entities/ChannelRole.js';
import ChannelRoleFetchType from '../../constants/ChannelRoleFetchType.js';
import ChannelRoleUser from '../../entities/ChannelRoleUser.js';

export default class ChannelRoleHelper extends BaseHelper {
  async fetch (channelId, type, opts) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    const channel = await this.client.channel.fetch(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (type === ChannelRoleFetchType.ROLES) {
      if (!opts?.forceNew && channel.roleStore.roles.fetched) { return channel.roleStore.roles.values(); }

      const response = await this.client.websocket.emit(
        'group role summary',
        {
          body: {
            groupId: normalisedChannelId
          }
        }
      );

      channel.roleStore.roles.clear();
      channel.roleStore.roles.fetched = true;

      return response.body.map(
        (serverGroupRole) =>
          channel.roleStore.roles.set(
            new ChannelRole(this.client, serverGroupRole)
          )
      );
    }

    if (!opts?.forceNew && channel.roleStore.users.fetched) { return channel.roleStore.users.values(); }

    const response = await this.client.websocket.emit(
      'group user subscriber list',
      {
        body: {
          groupId: normalisedChannelId,
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    channel.roleStore.users.clear();
    channel.roleStore.users.fetched = true;

    return response.body.map(
      (serverGroupRoleUser) => {
        serverGroupRoleUser.groupId = normalisedChannelId;

        return channel.roleStore.users.set(
          new ChannelRoleUser(this.client, serverGroupRoleUser)
        );
      }
    );
  }

  async assign (channelId, userId, roleId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedUserId = this.normaliseNumber(userId);
    const normalisedRoleId = this.normaliseNumber(roleId);

    const channel = await this.client.channel.fetch(normalisedChannelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isOwner) { throw new Error(`Bot must be owner of Channel with ID ${normalisedChannelId} to assign roles`); }

    const member = await this.client.channel.member.fetch(channel.id, userId);

    if (member === null) { throw new Error(`Member with ID ${normalisedUserId} NOT FOUND in Channel with ID ${channel.id}`); }

    return await this.client.websocket.emit(
      'group role subscriber assign',
      {
        groupId: normalisedChannelId,
        roleId: normalisedRoleId,
        subscriberId: normalisedUserId
      }
    );
  }

  async unassign (channelId, userId, roleId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedUserId = this.normaliseNumber(userId);
    const normalisedRoleId = this.normaliseNumber(roleId);

    const channel = await this.client.channel.fetch(normalisedChannelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isOwner) { throw new Error(`Bot must be owner of Channel with ID ${normalisedChannelId} to assign roles`); }

    const member = await this.client.channel.member.fetch(channel.id, userId);

    if (member === null) { throw new Error(`Member with ID ${normalisedUserId} NOT FOUND in Channel with ID ${channel.id}`); }

    return await this.client.websocket.emit(
      'group role subscriber assign',
      {
        groupId: normalisedChannelId,
        roleId: normalisedRoleId,
        subscriberId: normalisedUserId
      }
    );
  }

  async reassign (channelId, oldUserId, newUserId, roleId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedOldUserId = this.normaliseNumber(oldUserId);
    const normalisedNewUserId = this.normaliseNumber(newUserId);
    const normalisedRoleId = this.normaliseNumber(roleId);

    const channel = await this.client.channel.fetch(normalisedChannelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isOwner) { throw new Error(`Bot must be owner of Channel with ID ${normalisedChannelId} to assign roles`); }

    const previousMember = await this.client.channel.member.fetch(channel.id, normalisedOldUserId);

    if (previousMember === null) { throw new Error(`Member with ID ${normalisedOldUserId} NOT FOUND in Channel with ID ${channel.id}`); }

    const newMember = await this.client.channel.member.fetch(channel.id, normalisedOldUserId);

    if (newMember === null) { throw new Error(`Member with ID ${normalisedNewUserId} NOT FOUND in Channel with ID ${channel.id}`); }

    return await this.client.websocket.emit(
      'group role subscriber assign',
      {
        groupId: normalisedChannelId,
        roleId: normalisedRoleId,
        subscriberId: normalisedOldUserId,
        replaceSubscriberId: normalisedNewUserId
      }
    );
  }
}
