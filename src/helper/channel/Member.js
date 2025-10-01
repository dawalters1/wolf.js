
import { StatusCodes } from 'http-status-codes';
import  MemberListType  from'../../constants/MemberListType.js';
import  Command from '../../constants/Command.js';
import patch  from '../../utils/patch.js';
import ChannelMember from '../../models/ChannelMember.js';
import Base from '../Base.js';
import validator from '../../validator/index.js';
import Privilege from '../../constants/Privilege.js';
import Capability from '../../constants/Capability.js';

const canPerformActionAgainstMember = async (client, channel, targetMember, targetCapability) => {
    if (targetCapability === Capability.OWNER) return false;
    if (channel.isOwner) return true;

    const sourceMemberHasGap = client.currentSubscriber.privilegeList.includes(Privilege.GROUP_ADMIN) ?? false;

    const hasHigherCapability = (() => {
      switch (channel.capabilities) {
        case Capability.CO_OWNER:
          return [Capability.ADMIN, Capability.MOD, Capability.REGULAR, Capability.NOT_MEMBER, Capability.BANNED].includes(targetMember.capabilities);
        case Capability.ADMIN:
          return channel.extended?.advancedAdmin
            ? [Capability.ADMIN, Capability.MOD, Capability.REGULAR, Capability.SILENCED, Capability.BANNED, Capability.NOT_MEMBER].includes(targetMember.capabilities)
            : [Capability.MOD, Capability.REGULAR, Capability.SILENCED, Capability.BANNED, Capability.NOT_MEMBER].includes(targetMember.capabilities);
        case Capability.MOD:
          return [Capability.REGULAR, Capability.SILENCED, Capability.BANNED, Capability.NOT_MEMBER].includes(targetMember.capabilities);
        default:
          return false;
      }
    })();

    const targetUser = await client.subscriber.getById(targetMember.id);
    const targetMemberHasGap = targetUser?.privilegeList.includes(Privilege.GROUP_ADMIN) ?? false;

    if (targetCapability && [Capability.SILENCED, Capability.BANNED].includes(targetCapability) && targetMemberHasGap ){ return false;}

    return sourceMemberHasGap || hasHigherCapability;
  };

class Member extends Base {
  constructor(client) {
    super(client)
  }

  async _getList(channel, list, returnCurrentList = false) {
    if (channel.members._metadata[list] || returnCurrentList) {
      return [...channel.members._members.values()].filter((member) => member.lists.has(list));
    }

    const listConfig = this.client._frameworkConfig.get(`members.${list}`);
    const command = this._getCommandForList(list);

    const fetchMembers = async (result = []) => {
      try {
        const response = await this.client.websocket.emit(
          command,
          {
            headers: {
              version: listConfig.version,
            },
            body: {
              [listConfig.key]: channel.id,
              limit: listConfig.size,
              after: listConfig.batchType === 'after' ? result.at(-1)?.id : undefined,
              filter: listConfig.batchType === 'offset' ? list : undefined,
              offset: listConfig.batchType === 'offset' ? result.length : undefined,
              subscribe: 'subscribe' in listConfig ? listConfig.subscribe : undefined
            }
          }
        );

        result.push(...response.body.map((serverGroupMember) => {
          const existing = channel.members._members.get(serverGroupMember.id);
          return channel.members._members.set(
            serverGroupMember.id,
            existing
              ? patch(existing, {...serverGroupMember, targetGroupId: channel.id})
              : new ChannelMember(this.client, {...serverGroupMember, targetGroupId: channel.id}, list)
          );
        }));

        const complete = listConfig.batched
          ? response.body.length < listConfig.limit
          : true;

        channel.members._metadata[list] = complete;

        return complete ? result : await fetchMembers(result);
      } catch (err) {
        if (err.code === StatusCodes.NOT_FOUND) return [];
        throw err;
      }
    };

    return fetchMembers();
  }

  _getCommandForList(list) {
    switch (list) {
      case MemberListType.PRIVILEGED: return Command.GROUP_MEMBER_PRIVILEGED_LIST;
      case MemberListType.REGULAR: return Command.GROUP_MEMBER_REGULAR_LIST;
      case MemberListType.SILENCED:
      case MemberListType.BOTS: return Command.GROUP_MEMBER_SEARCH;
      case MemberListType.BANNED: return Command.GROUP_MEMBER_BANNED_LIST;
      default: throw new Error(`Unknown list type: ${list}`);
    }
  }

  //Legacy
  async getPrivilegedList (channelId) {
    if (validator.isNullOrUndefined(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be null or undefined', { channelId });
    } else if (!validator.isValidNumber(channelId)) {
      throw new models.WOLFAPIError('channelId must be a valid number', { channelId });
    } else if (validator.isLessThanOrEqualZero(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be less than or equal to 0', { channelId });
    }

    return await this.getList(channelId, MemberListType.PRIVILEGED)
  }

  //Legacy
  async getRegularList (channelId, returnCurrentList = false) {
    if (validator.isNullOrUndefined(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be null or undefined', { channelId });
    } else if (!validator.isValidNumber(channelId)) {
      throw new models.WOLFAPIError('channelId must be a valid number', { channelId });
    } else if (validator.isLessThanOrEqualZero(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be less than or equal to 0', { channelId });
    }

    if (!validator.isValidBoolean(returnCurrentList)) {
      throw new models.WOLFAPIError('returnCurrentList must be a valid boolean', { returnCurrentList });
    }

    return await this.getList(channelId, MemberListType.REGULAR, returnCurrentList)
  }

  //Legacy
  async getSilencedList (channelId, returnCurrentList = false) {
    if (validator.isNullOrUndefined(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be null or undefined', { channelId });
    } else if (!validator.isValidNumber(channelId)) {
      throw new models.WOLFAPIError('channelId must be a valid number', { channelId });
    } else if (validator.isLessThanOrEqualZero(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be less than or equal to 0', { channelId });
    }

    if (!validator.isValidBoolean(returnCurrentList)) {
      throw new models.WOLFAPIError('returnCurrentList must be a valid boolean', { returnCurrentList });
    }

    return await this.getList(channelId, MemberListType.SILENCED, returnCurrentList)
  }

    //Legacy
  async getBannedList (channelId, returnCurrentList = false) {
    if (validator.isNullOrUndefined(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be null or undefined', { channelId });
    } else if (!validator.isValidNumber(channelId)) {
      throw new models.WOLFAPIError('channelId must be a valid number', { channelId });
    } else if (validator.isLessThanOrEqualZero(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be less than or equal to 0', { channelId });
    }

    if (!validator.isValidBoolean(returnCurrentList)) {
      throw new models.WOLFAPIError('returnCurrentList must be a valid boolean', { returnCurrentList });
    }

    return await this.getList(channelId, MemberListType.BANNED, returnCurrentList)
  }

  //Legacy
  async getBotList (channelId) {
    if (validator.isNullOrUndefined(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be null or undefined', { channelId });
    } else if (!validator.isValidNumber(channelId)) {
      throw new models.WOLFAPIError('channelId must be a valid number', { channelId });
    } else if (validator.isLessThanOrEqualZero(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be less than or equal to 0', { channelId });
    }

    return await this.getList(channelId, MemberListType.BOTS)
  } 

  async getList(channelId, list, returnCurrentList = false) {
    if (validator.isNullOrUndefined(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be null or undefined', { channelId });
    } else if (!validator.isValidNumber(channelId)) {
      throw new models.WOLFAPIError('channelId must be a valid number', { channelId });
    } else if (validator.isLessThanOrEqualZero(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be less than or equal to 0', { channelId });
    }

    if (!validator.isValidBoolean(returnCurrentList)) {
      throw new models.WOLFAPIError('returnCurrentList must be a valid boolean', { returnCurrentList });
    }
    

    const channel = await this.client.channel.getById(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found`);
    if (!channel.inChannel) throw new Error(`Not a member of channel ${channelId}`);

    return this._getList(channel, list, returnCurrentList);
  }

  //Legacy
  async get(channelId, subscriberId){
    if (validator.isNullOrUndefined(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be null or undefined', { channelId });
    } else if (!validator.isValidNumber(channelId)) {
      throw new models.WOLFAPIError('channelId must be a valid number', { channelId });
    } else if (validator.isLessThanOrEqualZero(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be less than or equal to 0', { channelId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    return this.getMember(channelId, subscriberId)
  }

  async getMember(channelId, userId) {
    if (validator.isNullOrUndefined(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be null or undefined', { channelId });
    } else if (!validator.isValidNumber(channelId)) {
      throw new models.WOLFAPIError('channelId must be a valid number', { channelId });
    } else if (validator.isLessThanOrEqualZero(channelId)) {
      throw new models.WOLFAPIError('channelId cannot be less than or equal to 0', { channelId });
    }

    const channel = await this.client.channel.getById(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found`);
    if (!channel.inChannel) throw new Error(`Not a member of channel ${channelId}`);

    const cached = channel.members._members.get(userId);
    if (cached) return cached;

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER,
      {
        body: {
          groupId: channel.id,
          subscriberId: userId
        }
      }
    );

    if(response.success){
      return channel.members._members.set(userId, new ChannelMember(this.client, {...response.body, targetGroupId: channel.id})).get(userId);
    }

    if(response.code === StatusCodes.NOT_FOUND){
      return null;
    }

    throw response;
  }

  async updateCapability(channelId, userId, target, allowedFrom) {
    const channel = await this.client.channel.getById(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found`);
    if (!channel.inChannel) throw new Error(`Not a member of channel ${channelId}`);

    const member = await this.getMember(channelId, userId);
    if (!member) throw new Error('Member not found');

    if (!await canPerformActionAgainstMember(this.client, channel, member, target)) {
      throw new Error(`Insufficient permissions to change capability to ${target}`);
    }

    if (!allowedFrom.includes(member.capabilities)) {
      throw new Error(`Invalid transition from ${member.capabilities} to ${target}`);
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

  async coowner(channelId, userId) {
    return this.updateCapability(channelId, userId, Capability.CO_OWNER, [
      Capability.ADMIN, Capability.MOD, Capability.REGULAR
    ]);
  }

  async admin(channelId, userId) {
    return this.updateCapability(channelId, userId, Capability.ADMIN, [
      Capability.CO_OWNER, Capability.MOD, Capability.REGULAR
    ]);
  }

  async mod(channelId, userId) {
    return this.updateCapability(channelId, userId, Capability.MOD, [
      Capability.CO_OWNER, Capability.ADMIN, Capability.REGULAR
    ]);
  }

  async regular(channelId, userId) {
    return this.updateCapability(channelId, userId, Capability.REGULAR, [
      Capability.CO_OWNER, Capability.ADMIN, Capability.MOD, Capability.SILENCED
    ]);
  }

  async silence(channelId, userId) {
    return this.updateCapability(channelId, userId, Capability.SILENCED, [
      Capability.REGULAR
    ]);
  }

  async ban(channelId, userId) {
    return this.updateCapability(channelId, userId, Capability.BANNED, [
      Capability.REGULAR, Capability.SILENCED
    ]);
  }

  async kick(channelId, userId) {
    const channel = await this.client.channel.getById(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found`);
    if (!channel.inChannel) throw new Error(`Not a member of channel ${channelId}`);
    const member = await this.getMember(channelId, userId);
    if (!member) throw new Error('Member not found');

    if (!await canPerformActionAgainstMember(this.client, channel, member, Capability.BANNED)) {
      throw new Error('Insufficient permissions to kick member');
    }

    if (![Capability.REGULAR, Capability.SILENCED, Capability.BANNED].includes(member.capabilities)) {
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

export default Member;
