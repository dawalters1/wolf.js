import { Capability, Command, Privilege } from '../../constants/index.js';
import Base from '../Base.js';
import validator from '../../validator/index.js';
import models, { GroupMember, WOLFAPIError } from '../../models/index.js';

const canRequestList = async (client, myCapability, includeAllButBanned = false) => {
  if (await client.utility.subscriber.privilege.has(client.currentSubscriber.id, Privilege.GROUP_ADMIN)) {
    return true;
  }

  const requiredCapabilities = [Capability.OWNER, Capability.MOD, Capability.ADMIN];

  if (includeAllButBanned) {
    requiredCapabilities.push(...[Capability.REGULAR, Capability.SILENCED]);
  }

  return requiredCapabilities.includes(myCapability);
};

const isMyCapabilityHigher = (myCapabilities, theirCapability, advancedAdmin) => {
  if (theirCapability === Capability.OWNER) {
    return false;
  }

  if (advancedAdmin) {
    return true;
  }

  switch (myCapabilities) {
    case Capability.ADMIN:
      return [Capability.MOD || Capability.REGULAR || Capability.SILENCED || Capability.BANNED].includes(theirCapability);
    case Capability.MOD:
      return [Capability.REGULAR || Capability.SILENCED || Capability.BANNED].includes(theirCapability);
    default:
      return false;
  }
};

const canPerformGroupAction = async (client, channel, targetGroupMember, newCapability) => {
  if (channel.owner.id === targetGroupMember.id || newCapability === Capability.OWNER) {
    return false;
  }

  if (await client.utility.subscriber.privilege.has(client.currentSubscriber.id, Privilege.GROUP_ADMIN)) {
    if (await client.utility.subscriber.privilege.has(targetGroupMember.id, Privilege.GROUP_ADMIN) && (newCapability === Capability.BANNED || newCapability === Capability.SILENCED)) {
      return false;
    }

    return true;
  }

  if (channel.extended.advancedAdmin) {
    return true;
  }

  return isMyCapabilityHigher(channel.capabilities, targetGroupMember.capabilities, channel.extended.advancedAdmin) && isMyCapabilityHigher(channel.capabilities, newCapability, false);
};

/**
 * CANCEROUS ASS APPROACH, like wtf is this shit???
 */
class Member extends Base {
  async getBotList (targetGroupId, returnCurrentList = false) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    if (!await canRequestList(this.client, channel.capabilities, true)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetGroupId });
    }

    if (channel.members._bots.complete || returnCurrentList) {
      return channel.members._bots.members;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_SEARCH,
      {
        channelId: parseInt(targetGroupId),
        filter: 'bots',
        offset: channel.members._bots.members.length,
        limit: this.client._frameworkConfig.get('members.bots.batch.size')
      }
    );

    channel.members._bots.complete = response.body.length < this.client._frameworkConfig.get('members.bots.batch.size');
    channel.members._bots.members = response.body?.map((member) => new GroupMember(this.client, { ...member, targetGroupId })) ?? [];

    return channel.members._bots.members;
  }

  async getSilencedList (targetGroupId, returnCurrentList = false) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    if (channel.members._silenced.complete || returnCurrentList) {
      return channel.members._silenced.members;
    }

    if (channel.members._regular.complete) {
      const silenced = channel.members._regular.members.filter((member) => member.capabilities === Capability.SILENCED);

      channel.members._silenced.complete = true;
      channel.members._silenced.members = silenced;

      return channel.members._silenced.members;
    }

    if (!await canRequestList(this.client, channel.capabilities, true)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetGroupId });
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_SEARCH,
      {
        channelId: parseInt(targetGroupId),
        filter: 'silenced',
        offset: channel.members._silenced.members.length,
        limit: this.client._frameworkConfig.get('members.silenced.batch.size')
      }
    );

    channel.members._silenced.complete = response.body?.length < this.client._frameworkConfig.get('members.silenced.batch.size');
    channel.members._silenced.members = response.body?.map((member) => new GroupMember(this.client, { ...member, targetGroupId })) ?? [];

    return channel.members._silenced.members;
  }

  async getBannedList (targetGroupId, limit = 100) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new models.WOLFAPIError('limit cannot be null or undefined', { limit });
    } else if (!validator.isValidNumber(limit)) {
      throw new models.WOLFAPIError('limit must be a valid number', { limit });
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new models.WOLFAPIError('limit cannot be less than or equal to 0', { limit });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    if (channel.members._banned.complete) {
      return channel.members._banned.members;
    }

    if (!await canRequestList(this.client, channel.capabilities)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetGroupId });
    }

    if (channel.members._regular.complete) {
      const silenced = channel.members._regular.members.filter((member) => member.capabilities === Capability.BANNED);

      channel.members._banned.complete = true;
      channel.members._banned.members = silenced;

      return channel.members._banned.members;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_BANNED_LIST,
      {
        id: parseInt(targetGroupId),
        limit: this.client._frameworkConfig.get('members.banned.batch.size'),
        after: channel.members._banned.members.sort((a, b) => b.id - a.id).slice(-1)[0] ?? undefined
      }
    );

    channel.members._banned.complete = response.body?.length < this.client._frameworkConfig.get('members.banned.batch.size');
    channel.members._banned.members = response.body?.map((member) => new GroupMember(this.client, { ...member, capabilities: Capability.BANNED, targetGroupId })) ?? [];

    return channel.members._banned.members;
  }

  async getPrivilegedList (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    if (!await canRequestList(this.client, channel.capabilities, true)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetGroupId });
    }

    if (channel.members._privileged.complete) {
      return channel.members._privileged.members;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_PRIVILEGED_LIST,
      {
        id: parseInt(targetGroupId),
        subscribe: true
      }
    );

    if (!response.success) {
      return new WOLFAPIError('Privileged members request failed', { response });
    }

    channel.members._privileged.complete = true; // 2,500 is the max supported, however some channels still have more than this
    channel.members._privileged.members = response.body?.map((member) => new GroupMember(this.client, { ...member, targetGroupId })) ?? [];

    response.body?.forEach((member) => channel.members._misc.remove(member));

    return channel.members._privileged.members;
  }

  async getRegularList (targetGroupId, returnCurrentList = false) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    if (!await canRequestList(this.client, channel.capabilities, true)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetGroupId });
    }

    if (returnCurrentList || channel.members._regular.complete) {
      return channel.members._regular.members;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_REGULAR_LIST,
      {
        id: parseInt(targetGroupId),
        subscribe: true,
        after: channel.members._regular.members.sort((a, b) => b.id - a.id).slice(-1)[0] ?? undefined
      }
    );

    if (!response.success) {
      return new WOLFAPIError('Regular members request failed', { response });
    }

    channel.members._regular.complete = response.body.length < this.client._frameworkConfig.get('members.regular.batch.size');
    channel.members._regular.members = response.body?.map((member) => new GroupMember(this.client, { ...member, targetGroupId })) ?? [];

    response.body?.forEach((member) => channel.members._misc.remove(member));

    return channel.members._regular.members;
  }

  async get (targetGroupId, subscriberId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    const member = await channel.members._get(subscriberId);

    if (member) {
      return member;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER,
      {
        channelId: parseInt(targetGroupId),
        subscriberId: parseInt(subscriberId)
      }
    );

    if (response.success) {
      await channel.members._onJoin(await this.client.subscriber.getById(subscriberId, false), response.body.capabilities);

      return await channel.members._get(subscriberId);
    }

    return undefined;
  }

  async admin (targetGroupId, subscriberId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    const member = await this.get(targetGroupId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetGroupId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, channel, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to admin', { targetGroupId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        channelId: parseInt(targetGroupId),
        id: parseInt(subscriberId),
        capabilities: Capability.ADMIN
      }
    );
  }

  async mod (targetGroupId, subscriberId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    const member = await this.get(targetGroupId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetGroupId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, channel, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to mod', { targetGroupId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        channelId: parseInt(targetGroupId),
        id: parseInt(subscriberId),
        capabilities: Capability.MOD
      }
    );
  }

  async regular (targetGroupId, subscriberId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    const member = await this.get(targetGroupId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetGroupId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, channel, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to reset', { targetGroupId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        channelId: parseInt(targetGroupId),
        id: parseInt(subscriberId),
        capabilities: Capability.REGULAR
      }
    );
  }

  async silence (targetGroupId, subscriberId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    const member = await this.get(targetGroupId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetGroupId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, channel, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to silence', { targetGroupId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        channelId: parseInt(targetGroupId),
        id: parseInt(subscriberId),
        capabilities: Capability.SILENCED
      }
    );
  }

  async ban (targetGroupId, subscriberId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    const member = await this.get(targetGroupId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetGroupId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, channel, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to ban', { targetGroupId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        channelId: parseInt(targetGroupId),
        id: parseInt(subscriberId),
        capabilities: Capability.BANNED
      }
    );
  }

  async kick (targetGroupId, subscriberId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    const member = await this.get(targetGroupId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetGroupId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, channel, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to kick', { targetGroupId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        channelId: parseInt(targetGroupId),
        id: parseInt(subscriberId)
      }
    );
  }
}

export default Member;
