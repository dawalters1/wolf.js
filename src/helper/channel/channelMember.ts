import Channel from '../../structures/channel.ts';
import ChannelMember from '../../structures/channelMember.ts';
import { ChannelMemberCapability } from '../../constants/ChannelMemberCapability.ts';
import { ChannelMemberListType } from '../../constants/ChannelMemberListType.ts';
import { Command } from '../../constants/Command.ts';
import { StatusCodes } from 'http-status-codes';
import { UserPrivilege } from '../../constants/UserPrivilege.ts';
import WOLF from '../../client/WOLF.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

const canPerformChannelAction = async (
  client: WOLF,
  channel: Channel,
  targetMember: ChannelMember,
  targetCapability: ChannelMemberCapability
): Promise<boolean> => {
  if (targetCapability === ChannelMemberCapability.OWNER) return false;
  if (channel.isOwner) return true;

  const sourceMemberHasGap = client.me?.privilegeList.includes(UserPrivilege.GROUP_ADMIN) ?? false;

  const hasHigherCapability = (() => {
    switch (channel.capabilities) {
      case ChannelMemberCapability.CO_OWNER:
        return [ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR, ChannelMemberCapability.NONE, ChannelMemberCapability.BANNED].includes(targetMember.capabilities);
      case ChannelMemberCapability.ADMIN:
        return channel.extended?.advancedAdmin
          ? [ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(targetMember.capabilities)
          : [ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(targetMember.capabilities);
      case ChannelMemberCapability.MOD:
        return [ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(targetMember.capabilities);
      default:
        return false;
    }
  })();

  const targetUser = await client.user.getById(targetMember.id);
  const targetMemberHasGap = targetUser?.privilegeList.includes(UserPrivilege.GROUP_ADMIN) ?? false;

  if (
    [ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED].includes(targetCapability) &&
    targetMemberHasGap
  ) return false;

  return sourceMemberHasGap || hasHigherCapability;
};

class ChannelMemberHelper {
  client: Readonly<WOLF>;
  constructor (client: WOLF) {
    this.client = client;
  }

  private async _getList (channel: Channel, list: string): Promise<ChannelMember[]> {
    if (channel.members.metadata[list]) {
      return channel.members.values().filter(m => m.lists.has(list));
    }

    const listConfig = this.client.config.get(`framework.helper.channel.member.list.${list}`);
    const command = this._getCommandForList(list);

    const fetchMembers = async (result: ChannelMember[] = []): Promise<ChannelMember[]> => {
      try {
        const response = await this.client.websocket.emit<ChannelMember[]>(
          command,
          {
            body: {
              id: channel.id,
              limit: listConfig.limit,
              after: listConfig.batchType === 'after' ? result.at(-1)?.id : undefined,
              filter: listConfig.batchType === 'offset' ? list : undefined,
              offset: listConfig.batchType === 'offset' ? result.length : undefined,
              subscribe: 'subscribe' in listConfig ? listConfig.subscribe : undefined
            }
          }
        );

        response.body.forEach(m => m.addList(list));
        result.push(...response.body);

        const complete = listConfig.batched
          ? response.body.length < listConfig.limit
          : true;

        channel.members.metadata[list] = complete;

        return complete ? result : await fetchMembers(result);
      } catch (err: any) {
        if (err.code === StatusCodes.NOT_FOUND) return [];
        throw err;
      }
    };

    return fetchMembers();
  }

  private _getCommandForList (list: string): Command {
    switch (list) {
      case ChannelMemberListType.PRIVILEGED: return Command.GROUP_MEMBER_PRIVILEGED_LIST;
      case ChannelMemberListType.REGULAR: return Command.GROUP_MEMBER_REGULAR_LIST;
      case ChannelMemberListType.SILENCED:
      case ChannelMemberListType.BOTS: return Command.GROUP_MEMBER_SEARCH;
      case ChannelMemberListType.BANNED: return Command.GROUP_MEMBER_BANNED_LIST;
      default: throw new Error(`Unknown list type: ${list}`);
    }
  }

  async getList (channelId: number, list: ChannelMemberListType): Promise<ChannelMember[]> {
    const channel = await this.client.channel.getById(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found`);
    if (!channel.isMember) throw new Error(`Not a member of channel ${channelId}`);
    return this._getList(channel, list);
  }

  async getMember (channelId: number, userId: number): Promise<ChannelMember | null> {
    const channel = await this.client.channel.getById(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found`);
    if (!channel.isMember) throw new Error(`Not a member of channel ${channelId}`);

    const cached = channel.members.get(userId);
    if (cached) { return cached; };

    try {
      const response = await this.client.websocket.emit<ChannelMember>(
        Command.GROUP_MEMBER,
        {
          body: {
            groupId: channel.id,
            subscriberId: userId
          }
        }
      );

      return channel.members.set(response.body);
    } catch (err: any) {
      if (err.code === StatusCodes.NOT_FOUND) return null;
      throw err;
    }
  }

  private async updateCapability (channelId: number, userId: number, target: ChannelMemberCapability, allowedFrom: ChannelMemberCapability[]): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found`);
    if (!channel.isMember) throw new Error(`Not a member of channel ${channelId}`);
    const member = await this.getMember(channelId, userId);
    if (!member) { throw new Error('Member not found'); };

    if (!await canPerformChannelAction(this.client, channel, member, target)) {
      throw new Error(`Insufficient permissions to change capability to ${ChannelMemberCapability[target]}`);
    }

    if (!allowedFrom.includes(member.capabilities)) {
      throw new Error(`Invalid transition from ${ChannelMemberCapability[member.capabilities]} to ${ChannelMemberCapability[target]}`);
    }

    return this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: target
        }
      }
    );
  }

  async coowner (channelId: number, userId: number) {
    return this.updateCapability(channelId, userId, ChannelMemberCapability.CO_OWNER, [
      ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR
    ]);
  }

  async admin (channelId: number, userId: number) {
    return this.updateCapability(channelId, userId, ChannelMemberCapability.ADMIN, [
      ChannelMemberCapability.CO_OWNER, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR
    ]);
  }

  async mod (channelId: number, userId: number) {
    return this.updateCapability(channelId, userId, ChannelMemberCapability.MOD, [
      ChannelMemberCapability.CO_OWNER, ChannelMemberCapability.ADMIN, ChannelMemberCapability.REGULAR
    ]);
  }

  async regular (channelId: number, userId: number) {
    return this.updateCapability(channelId, userId, ChannelMemberCapability.REGULAR, [
      ChannelMemberCapability.CO_OWNER, ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.SILENCED
    ]);
  }

  async silence (channelId: number, userId: number) {
    return this.updateCapability(channelId, userId, ChannelMemberCapability.SILENCED, [
      ChannelMemberCapability.REGULAR
    ]);
  }

  async ban (channelId: number, userId: number) {
    return this.updateCapability(channelId, userId, ChannelMemberCapability.BANNED, [
      ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED
    ]);
  }

  async kick (channelId: number, userId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found`);
    if (!channel.isMember) throw new Error(`Not a member of channel ${channelId}`);
    const member = await this.getMember(channelId, userId);
    if (!member) { throw new Error('Member not found'); };

    if (!await canPerformChannelAction(this.client, channel, member, ChannelMemberCapability.BANNED)) {
      throw new Error('Insufficient permissions to kick member');
    }

    if (![ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED].includes(member.capabilities)) {
      throw new Error('Kick not permitted for current capability');
    }

    return this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        body: {
          groupId: channelId,
          id: userId
        }
      }
    );
  }
}

export default ChannelMemberHelper;
