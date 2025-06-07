import ChannelRole, { ServerChannelRole } from '../../structures/channelRole';
import { ChannelRoleOptions, ChannelRoleUserOptions } from '../../options/requestOptions';
import ChannelRoleUser, { ServerChannelRoleUser } from '../../structures/channelRoleUser';
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

    if (!opts?.forceNew && channel.roles.summaries.fetched) {
      return channel.roles.summaries.values();
    }

    const response = await this.client.websocket.emit<ServerChannelRole[]>(
      Command.GROUP_ROLE_SUMMARY,
      {
        body: {
          groupId: channelId
        }
      }
    );

    return channel.roles.summaries.setAll(response.body.map((serverChannelRole) => new ChannelRole(this.client, serverChannelRole)));
  }

  async users (channelId: number, opts?: ChannelRoleUserOptions): Promise<(ChannelRoleUser | null)[]> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);

    if (!opts?.forceNew && channel.roles.users.fetched) {
      return channel.roles.users.values();
    }

    const response = await this.client.websocket.emit<ServerChannelRoleUser[]>(
      Command.GROUP_ROLE_SUBSCRIBER_LIST,
      {
        body: {
          groupId: channelId,
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    return channel.roles.users.setAll(response.body.map((serverChannelRoleUser) => new ChannelRoleUser(this.client, serverChannelRoleUser)));
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
