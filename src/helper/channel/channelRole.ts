import ChannelRole, { ServerGroupRole } from '../../structures/channelRole';
import { ChannelRoleOptions, ChannelRoleUserOptions } from '../../options/requestOptions';
import ChannelRoleUser, { ServerGroupRoleUser } from '../../structures/channelRoleUser';
import { Command } from '../../constants/Command';
import WOLF from '../../client/WOLF';

class ChannelRoleHelper {
  readonly client: WOLF;

  constructor (client: WOLF) {
    this.client = client;
  }

  async roles (channelId: number, opts?: ChannelRoleOptions): Promise<(ChannelRole | null)[]> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);

    if (!opts?.forceNew && channel._roles.summaries.fetched) {
      return channel._roles.summaries.values();
    }

    const response = await this.client.websocket.emit<ServerGroupRole[]>(
      Command.GROUP_ROLE_SUMMARY,
      {
        body: {
          groupId: channelId
        }
      }
    );

    return response.body.map((ServerGroupRole) => {
      const existing = channel._roles.summaries.get(ServerGroupRole.roleId);

      return channel._roles.summaries.set(
        existing
          ? existing.patch(ServerGroupRole)
          : new ChannelRole(this.client, ServerGroupRole)
      );
    });
  }

  async users (channelId: number, opts?: ChannelRoleUserOptions): Promise<(ChannelRoleUser | null)[]> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);

    if (!opts?.forceNew && channel._roles.users.fetched) {
      return channel._roles.users.values();
    }

    const response = await this.client.websocket.emit<ServerGroupRoleUser[]>(
      Command.GROUP_ROLE_SUBSCRIBER_LIST,
      {
        body: {
          groupId: channelId,
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    return response.body.map((ServerGroupRoleUser) => {
      const existing = channel._roles.users.get(ServerGroupRoleUser.subscriberId);

      return channel._roles.users.set(
        existing
          ? existing.patch(ServerGroupRoleUser)
          : new ChannelRoleUser(this.client, ServerGroupRoleUser)
      );
    });
  }

  async assign (channelId: number, userId: number, roleId: number) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);
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

  async unassign (channelId: number, userId: number, roleId: number) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);
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

  async reassign (channelId: number, oldUserId: number, newUserId: number, roleId: number) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);
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
