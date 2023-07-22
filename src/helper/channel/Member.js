import { Capability, Command, Privilege } from '../../constants/index.js';
import Base from '../Base.js';
import validator from '../../validator/index.js';
import models, { ChannelMember, WOLFAPIError } from '../../models/index.js';

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
  /**
   * Get list of bots in the channel
   * @param {Number} targetChannelId
   * @param {Boolean} returnCurrentList
   * @returns {Promise<Array<ChannelMember>>}
   */
  async getBotList (targetChannelId, returnCurrentList = false) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    if (!await canRequestList(this.client, channel.capabilities, true)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetChannelId });
    }

    if (channel.members._bots.complete || returnCurrentList) {
      return channel.members._bots.members;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_SEARCH,
      {
        groupId: parseInt(targetChannelId),
        filter: 'bots',
        offset: channel.members._bots.members.length,
        limit: this.client._frameworkConfig.get('members.bots.batch.size')
      }
    );

    channel.members._bots.complete = response.body.length < this.client._frameworkConfig.get('members.bots.batch.size');
    channel.members._bots.members = response.body?.map((member) => new ChannelMember(this.client, { ...member, targetChannelId })) ?? [];

    return channel.members._bots.members;
  }

  /**
   * Get a channels silenced lists
   * @param {Number} targetChannelId
   * @param {Boolean} returnCurrentList
   * @returns {Promise<Array<ChannelMember>>}
   */
  async getSilencedList (targetChannelId, returnCurrentList = false) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
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
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetChannelId });
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_SEARCH,
      {
        groupId: parseInt(targetChannelId),
        filter: 'silenced',
        offset: channel.members._silenced.members.length,
        limit: this.client._frameworkConfig.get('members.silenced.batch.size')
      }
    );

    channel.members._silenced.complete = response.body?.length < this.client._frameworkConfig.get('members.silenced.batch.size');
    channel.members._silenced.members = response.body?.map((member) => new ChannelMember(this.client, { ...member, targetChannelId })) ?? [];

    return channel.members._silenced.members;
  }

  /**
   * Get a channels banned list (Mod required)
   * @param {Number} targetChannelId
   * @param {number} limit
   * @returns {Promise<Array<ChannelMember>>}
   */
  async getBannedList (targetChannelId, limit = 100) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new models.WOLFAPIError('limit cannot be null or undefined', { limit });
    } else if (!validator.isValidNumber(limit)) {
      throw new models.WOLFAPIError('limit must be a valid number', { limit });
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new models.WOLFAPIError('limit cannot be less than or equal to 0', { limit });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    if (channel.members._banned.complete) {
      return channel.members._banned.members;
    }

    if (!await canRequestList(this.client, channel.capabilities)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetChannelId });
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
        id: parseInt(targetChannelId),
        limit: this.client._frameworkConfig.get('members.banned.batch.size'),
        after: channel.members._banned.members.sort((a, b) => b.id - a.id).slice(-1)[0] ?? undefined
      }
    );

    channel.members._banned.complete = response.body?.length < this.client._frameworkConfig.get('members.banned.batch.size');
    channel.members._banned.members = response.body?.map((member) => new ChannelMember(this.client, { ...member, capabilities: Capability.BANNED, targetChannelId })) ?? [];

    return channel.members._banned.members;
  }

  /**
   * Get a channels privileged list
   * @param {Number} targetChannelId
   * @returns {Promise<Array<ChannelMember>>}
   */
  async getPrivilegedList (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    if (!await canRequestList(this.client, channel.capabilities, true)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetChannelId });
    }

    if (channel.members._privileged.complete) {
      return channel.members._privileged.members;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_PRIVILEGED_LIST,
      {
        id: parseInt(targetChannelId),
        subscribe: true
      }
    );

    if (!response.success) {
      return new WOLFAPIError('Privileged members request failed', { response });
    }

    channel.members._privileged.complete = true; // 2,500 is the max supported, however some channels still have more than this
    channel.members._privileged.members = response.body?.map((member) => new ChannelMember(this.client, { ...member, targetChannelId })) ?? [];

    response.body?.forEach((member) => channel.members._misc.remove(member));

    return channel.members._privileged.members;
  }

  /**
   * Get a channels regular list
   * @param {Number} targetChannelId
   * @param {Boolean} returnCurrentList
   * @returns {Promise<WOLFAPIError|*|[]|*[]>}
   */
  async getRegularList (targetChannelId, returnCurrentList = false) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    if (!await canRequestList(this.client, channel.capabilities, true)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetChannelId });
    }

    if (returnCurrentList || channel.members._regular.complete) {
      return channel.members._regular.members;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_REGULAR_LIST,
      {
        id: parseInt(targetChannelId),
        subscribe: true,
        after: channel.members._regular.members.sort((a, b) => b.id - a.id).slice(-1)[0] ?? undefined
      }
    );

    if (!response.success) {
      return new WOLFAPIError('Regular members request failed', { response });
    }

    channel.members._regular.complete = response.body.length < this.client._frameworkConfig.get('members.regular.batch.size');
    channel.members._regular.members = response.body?.map((member) => new ChannelMember(this.client, { ...member, targetChannelId })) ?? [];

    response.body?.forEach((member) => channel.members._misc.remove(member));

    return channel.members._regular.members;
  }

  /**
   * Get a subscriber
   * @param {Number} targetChannelId
   * @param {Number} subscriberId
   * @returns {Promise<ChannelMember>}
   */
  async get (targetChannelId, subscriberId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    const member = await channel.members._get(subscriberId);

    if (member) {
      return member;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER,
      {
        groupId: parseInt(targetChannelId),
        subscriberId: parseInt(subscriberId)
      }
    );

    if (response.success) {
      await channel.members._onJoin(await this.client.subscriber.getById(subscriberId, false), response.body.capabilities);

      return await channel.members._get(subscriberId);
    }

    return undefined;
  }

  /**
   * Admin a subscriber
   * @param {Number} targetChannelId
   * @param {Number} subscriberId
   * @returns {Promise<Response>}
   */
  async admin (targetChannelId, subscriberId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    const member = await this.get(targetChannelId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetChannelId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, channel, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to admin', { targetChannelId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        groupId: parseInt(targetChannelId),
        id: parseInt(subscriberId),
        capabilities: Capability.ADMIN
      }
    );
  }

  /**
   * Mod a subscriber
   * @param {Number} targetChannelId
   * @param {Number} subscriberId
   * @returns {Promise<Response>}
   */
  async mod (targetChannelId, subscriberId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    const member = await this.get(targetChannelId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetChannelId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, channel, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to mod', { targetChannelId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        groupId: parseInt(targetChannelId),
        id: parseInt(subscriberId),
        capabilities: Capability.MOD
      }
    );
  }

  /**
   * Reset a subscriber
   * @param {Number} targetChannelId
   * @param {Number} subscriberId
   * @returns {Promise<Response>}
   */
  async regular (targetChannelId, subscriberId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    const member = await this.get(targetChannelId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetChannelId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, channel, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to reset', { targetChannelId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        groupId: parseInt(targetChannelId),
        id: parseInt(subscriberId),
        capabilities: Capability.REGULAR
      }
    );
  }

  /**
   * Silence a subscriber
   * @param {Number} targetChannelId
   * @param {Number} subscriberId
   * @returns {Promise<Response>}
   */
  async silence (targetChannelId, subscriberId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    const member = await this.get(targetChannelId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetChannelId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, channel, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to silence', { targetChannelId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        groupId: parseInt(targetChannelId),
        id: parseInt(subscriberId),
        capabilities: Capability.SILENCED
      }
    );
  }

  /**
   * Ban a subscriber
   * @param {Number} targetChannelId
   * @param {Number} subscriberId
   * @returns {Promise<Response>}
   */
  async ban (targetChannelId, subscriberId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    const member = await this.get(targetChannelId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetChannelId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, channel, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to ban', { targetChannelId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        groupId: parseInt(targetChannelId),
        id: parseInt(subscriberId),
        capabilities: Capability.BANNED
      }
    );
  }

  /**
   * Kick a subscriber
   * @param {Number} targetChannelId
   * @param {Number} subscriberId
   * @returns {Promise<Response>}
   */
  async kick (targetChannelId, subscriberId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    const member = await this.get(targetChannelId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetChannelId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, channel, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to kick', { targetChannelId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        groupId: parseInt(targetChannelId),
        id: parseInt(subscriberId)
      }
    );
  }
}

export default Member;
