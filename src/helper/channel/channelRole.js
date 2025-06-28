import ChannelRole from '../../entities/channelRole.js';
import ChannelRoleUser from '../../entities/channelRoleUser.js';
import { Command } from '../../constants/Command.js';

class ChannelRoleHelper {
  constructor (client) {
    this.client = client;
  }

  async roles (channelId, opts) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    if (!opts?.forceNew && channel._roles.summaries.fetched) {
      return channel._roles.summaries.values();
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_ROLE_SUMMARY,
      {
        body: {
          groupId: channelId
        }
      }
    );

    return response.body.map(serverGroupRole => {
      const existing = channel._roles.summaries.get(serverGroupRole.roleId);

      return channel._roles.summaries.set(
        existing
          ? existing.patch(serverGroupRole)
          : new ChannelRole(this.client, serverGroupRole)
      );
    });
  }

  async users (channelId, opts) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    if (!opts?.forceNew && channel._roles.users.fetched) {
      return channel._roles.users.values();
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_ROLE_SUBSCRIBER_LIST,
      {
        body: {
          groupId: channelId,
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    return response.body.map(serverGroupRoleUser => {
      const existing = channel._roles.users.get(serverGroupRoleUser.subscriberId);

      return channel._roles.users.set(
        existing
          ? existing.patch(serverGroupRoleUser)
          : new ChannelRoleUser(this.client, serverGroupRoleUser)
      );
    });
  }

  async assign (channelId, userId, roleId) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }
    if (!channel.isOwner) { throw new Error('Bot must be owner of channel to assign roles'); }

    const member = await this.client.channel.member.getMember(channelId, userId);

    if (member === null) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_ROLE_SUBSCRIBER_ASSIGN,
      {
        groupId: channelId,
        roleId,
        subscriberId: userId
      }
    );
  }

  async unassign (channelId, userId, roleId) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }
    if (!channel.isOwner) { throw new Error('Bot must be owner of channel to unassign roles'); }

    return await this.client.websocket.emit(
      Command.GROUP_ROLE_SUBSCRIBER_UNASSIGN,
      {
        groupId: channelId,
        roleId,
        subscriberId: userId
      }
    );
  }

  async reassign (channelId, oldUserId, newUserId, roleId) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }
    if (!channel.isOwner) { throw new Error('Bot must be owner of channel to reassign roles'); }

    return await this.client.websocket.emit(
      Command.GROUP_ROLE_SUBSCRIBER_ASSIGN,
      {
        groupId: channelId,
        roleId,
        subscriberId: oldUserId,
        replaceSubscriberId: newUserId
      }
    );
  }
}

export default ChannelRoleHelper;
