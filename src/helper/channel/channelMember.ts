import WOLF from '../../client/WOLF.ts';
import { ChannelMemberCapability } from '../../constants/ChannelMemberCapability.ts';
import { ChannelMemberListType } from '../../constants/ChannelMemberListType.ts';
import { Command } from '../../constants/Command.ts';
import { UserPrivilege } from '../../constants/UserPrivilege.ts';
import Channel from '../../structures/channel.ts';
import ChannelMember from '../../structures/channelMember.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';
import Base from '../base.ts';

const canPerformChannelAction = async (client: WOLF, channel: Channel, targetMember: ChannelMember, targetCapability: ChannelMemberCapability) => {
  if (targetCapability === ChannelMemberCapability.OWNER) { return false; }

  if (channel.isOwner) { return true; }

  const sourceMemberHasGap = client.user.privilegeList.includes(UserPrivilege.GROUP_ADMIN);

  if (targetCapability === ChannelMemberCapability.CO_OWNER) {
    if (sourceMemberHasGap) { return true; }

    return false;
  }

  const isSourceMemberCapabilityHigher = sourceMemberHasGap ?? (() => {
    switch (channel.capabilities) {
      case ChannelMemberCapability.CO_OWNER:
        return [ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR, ChannelMemberCapability.NONE, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(targetMember.capabilities);
      case ChannelMemberCapability.ADMIN:
        if (channel.extended && channel.extended.advancedAdmin) {
          return [ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(targetMember.capabilities);
        }
        return [ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(targetMember.capabilities);
      case ChannelMemberCapability.MOD:
        return [ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(targetMember.capabilities);
      default:
        return false;
    }
  });

  const targetUser = await client.user.getById(targetMember.id);

  const targetMemberHasGap = targetUser.privilegeList.includes(UserPrivilege.GROUP_ADMIN);

  if ([ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED].includes(targetCapability) && targetMemberHasGap) { return false; }

  return isSourceMemberCapabilityHigher;
};

class ChannelMemberHelper extends Base {
  async _getList (channel: Channel, list: string) {
    // Entirety of requested list has been cached, return it
    if (channel.members.metadata[list]) {
      return channel.members
        .values()
        .filter((member) => member.lists.has(list));
    }

    // TODO: This needs to be done
    const listConfig = this.client.config.get(`framework.helper.channel.member.list.${list}`);

    // Determine which command to use
    const command = (() => {
      switch (list) {
        case ChannelMemberListType.PRIVILEGED:
          return Command.GROUP_MEMBER_PRIVILEGED_LIST;
        case ChannelMemberListType.REGULAR:
          return Command.GROUP_MEMBER_REGULAR_LIST;
        case ChannelMemberListType.SILENCED:
          return Command.GROUP_MEMBER_SEARCH;
        case ChannelMemberListType.BANNED:
          return Command.GROUP_MEMBER_BANNED_LIST;
        case ChannelMemberListType.BOTS:
          return Command.GROUP_MEMBER_SEARCH;
        default:
          throw new Error(`Unknown list type ${list}`);
      }
    })();

    const get = async (members: ChannelMember[] = []): Promise<ChannelMember[]> => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await this.client.websocket.emit<ChannelMember[]>(
          command,
          {
            body: {
              id: channel.id,
              limit: listConfig.limit,
              // GROUP_MEMBER_*_LIST list batching
              after: listConfig.batchType === 'after'
                ? (members.slice(-1)[0]?.id ?? undefined)
                : undefined,
              // GROUP_MEMBER_SEARCH batching
              filter: listConfig.batchType === 'offset'
                ? list
                : undefined,
              // GROUP_MEMBER_SEARCH batching
              offset: listConfig.batchType === 'offset'
                ? members.length
                : undefined,
              // Whether a list can be subscribed to
              subscribe: Reflect.has(listConfig, 'subscribe')
                ? listConfig.subscribe
                : undefined
            }
          }
        );

        channel.members.metadata[list] = listConfig.batched
          ? response.body.length < listConfig.limit
          : true;

        response.body.forEach((channelMember) => channelMember.addList(list));

        members.push(...response.body);

        return channel.members.metadata[list]
          ? members
          : await get(members);
      } catch (error) {
        // Handle
        // if (error.code === StatusCodes.NOT_FOUND) { return []; }
        throw error;
      }
    };

    return await get();
  }

  async _getMember (channel: Channel, userId: number) {
    const cached = channel.members.get(userId);

    if (cached) { return cached; }

    // eslint-disable-next-line no-useless-catch
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
    } catch (error) {
      //   if (error.code === StatusCodes.NOT_FOUND) { return null; }
      throw error;
    }
  }

  async getList (channelId: number, list: ChannelMemberListType): Promise<ChannelMember[]> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(); }

    if (!channel.isMember) { throw new Error(); }

    return await this._getList(channel, list);
  }

  async getMember (channelId: number, userId: number): Promise<ChannelMember> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(); }

    if (!channel.isMember) { throw new Error(); }

    return await this._getMember(channel, userId);
  }

  async coowner (channelId: number, userId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(); }

    const member = await this.getMember(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(this.client, channel, member, ChannelMemberCapability.CO_OWNER)) { throw new Error(''); }

    if (![ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR].includes(member.capabilities)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: ChannelMemberCapability.CO_OWNER
        }
      }
    );
  }

  async admin (channelId: number, userId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(); }

    const member = await this.getMember(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(this.client, channel, member, ChannelMemberCapability.ADMIN)) { throw new Error(''); }

    if (![ChannelMemberCapability.CO_OWNER, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR].includes(member.capabilities)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: ChannelMemberCapability.ADMIN
        }
      }
    );
  }

  async mod (channelId: number, userId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(); }

    const member = await this.getMember(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(this.client, channel, member, ChannelMemberCapability.MOD)) { throw new Error(''); }

    if (![ChannelMemberCapability.CO_OWNER, ChannelMemberCapability.ADMIN, ChannelMemberCapability.REGULAR].includes(member.capabilities)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: ChannelMemberCapability.MOD
        }
      }
    );
  }

  async regular (channelId: number, userId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(); }

    const member = await this.getMember(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(this.client, channel, member, ChannelMemberCapability.REGULAR)) { throw new Error(''); }

    if (![ChannelMemberCapability.CO_OWNER, ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.SILENCED].includes(member.capabilities)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: ChannelMemberCapability.REGULAR
        }
      }
    );
  }

  async silence (channelId: number, userId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(); }

    const member = await this.getMember(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(this.client, channel, member, ChannelMemberCapability.SILENCED)) { throw new Error(''); }

    if (![ChannelMemberCapability.REGULAR].includes(member.capabilities)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: ChannelMemberCapability.SILENCED
        }
      }
    );
  }

  async ban (channelId: number, userId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(); }

    const member = await this.getMember(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(this.client, channel, member, ChannelMemberCapability.BANNED)) { throw new Error(''); }

    if (![ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED].includes(member.capabilities)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: ChannelMemberCapability.BANNED
        }
      }
    );
  }

  async kick (channelId: number, userId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(); }

    const member = await this.getMember(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(this.client, channel, member, ChannelMemberCapability.BANNED)) { throw new Error(''); }

    if (![ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED].includes(member.capabilities)) { throw new Error(''); }

    return await this.client.websocket.emit(
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
