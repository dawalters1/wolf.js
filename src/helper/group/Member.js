import { Capability, Command, Privilege } from '../../constants/index.js';
import { Base } from '../Base.js';
import validator from '../../validator/index.js';
import models, { GroupMember } from '../../models/index.js';

const canRequestList = async (client, myCapability, includeAllButBanned = false) => {
  if (await client.utility.subscriber.privilege.has(client.currentSubscriber.id, Privilege.GROUP_ADMIN)) {
    return true;
  }

  const requiredCapabilities = [Capability.OWNER || Capability.MOD || Capability.ADMIN];

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

const canPerformGroupAction = async (client, group, targetGroupMember, newCapability) => {
  if (group.owner.id === targetGroupMember.id || newCapability === Capability.OWNER) {
    return false;
  }

  const targetHasGAP = await client.utility.subscriber.privilege.has(targetGroupMember.id, Privilege.GROUP_ADMIN);

  if (client.utility.subscriber.privilege.has(Privilege.GROUP_ADMIN)) {
    if (targetHasGAP && (newCapability === Capability.BANNED || newCapability === Capability.SILENCED)) {
      return false;
    }

    return true;
  }

  if (group.extended.advancedAdmin) {
    return true;
  }

  return isMyCapabilityHigher(group.capabilities, targetGroupMember.capabilities, group.extended.advancedAdmin) && isMyCapabilityHigher(group.capabilities, newCapability, false);
};

/**
 * CANCEROUS ASS APPROACH, like wtf is this shit???
 */
class Member extends Base {
  async getBotList (targetGroupId, limit = 25) {
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    if (!await canRequestList(this.client, group.capabilities, true)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetGroupId });
    }

    if (group.members.bots.complete) {
      return group.members.bots.list;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_SEARCH,
      {
        groupId: parseInt(targetGroupId),
        filter: 'bots',
        offset: group.members.bots.list.length,
        limit: parseInt(limit)
      }
    );

    return group.members.bots._add(response.body.map((member) => new models.GroupMember(this.client, member)), response.success && response.body.length <= this.client._botConfig.get('server.defaults.search.limit'));
  }

  async getSilencedList (targetGroupId, limit = 25) {
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    if (!await canRequestList(this.client, group.capabilities, true)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetGroupId });
    }

    if (group.members.silenced.complete) {
      return group.members.silenced.list;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_SEARCH,
      {
        groupId: parseInt(targetGroupId),
        filter: 'silenced',
        offset: group.members.silenced.list.length,
        limit: parseInt(limit)
      }
    );

    return group.members.silenced._add(response.body.map((member) => new models.GroupMember(this.client, member)), response.success && response.body.length <= this.client._botConfig.get('server.defaults.search.limit'));
  }

  async getBannedList (targetGroupId, limit = 25) {
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    if (!await canRequestList(this.client, group.capabilities)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetGroupId });
    }

    if (group.members.banned.complete) {
      return group.members.banned.list;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_BANNED_LIST,
      {
        id: parseInt(targetGroupId),
        limit: parseInt(limit),
        after: group.members.banned.list.sort((a, b) => b.id - a.id).slice(-1)[0] ?? undefined
      }
    );

    return group.members.banned._add(response.success ? response.body.map((member) => new models.GroupMember(this.client, member)) : [], response.success && response.body.length <= this.client._botConfig.get('server.defaults.members.banned.limit'));
  }

  async getPrivilegedList (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    if (!await canRequestList(this.client, group.capabilities, true)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetGroupId });
    }

    if (group.members.privileged.complete) {
      return group.members.privileged.list;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_PRIVILEGED_LIST,
      {
        id: parseInt(targetGroupId),
        subscribe: true
      }
    );

    return group.members.privileged._add(response.success ? response.body.map((member) => new models.GroupMember(this.client, member)) : [], response.success);
  }

  async getRegularList (targetGroupId, limit = 100) {
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    if (!await canRequestList(this.client, group.capabilities, true)) {
      throw new models.WOLFAPIError('Insufficient privileges to fetch list', { targetGroupId });
    }

    if (group.members.regular.complete) {
      return group.members.privileged.list;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER_REGULAR_LIST,
      {
        id: parseInt(targetGroupId),
        subscribe: true,
        after: group.members.regular.list.sort((a, b) => b.id - a.id).slice(-1)[0] ?? undefined
      }
    );

    return group.members.regular._add(response.success ? response.body.map((member) => new models.GroupMember(this.client, member)) : [], response.success && response.body.length <= this.client._botConfig.get('server.defaults.members.regular.limit'));
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    const member = group.members._get(subscriberId);

    if (member) {
      return member;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_MEMBER,
      {
        groupId: parseInt(targetGroupId),
        subscriberId: parseInt(subscriberId)
      }
    );

    if (response.success) {
      const member = new GroupMember(this.client, response.body);

      // Add user to misc as not to mess up requesting data
      group.members.misc.push(member);

      return member;
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    const member = await this.get(targetGroupId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetGroupId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, group, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to admin', { targetGroupId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        groupId: parseInt(targetGroupId),
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    const member = await this.get(targetGroupId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetGroupId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, group, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to mod', { targetGroupId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        groupId: parseInt(targetGroupId),
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    const member = await this.get(targetGroupId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetGroupId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, group, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to reset', { targetGroupId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        groupId: parseInt(targetGroupId),
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    const member = await this.get(targetGroupId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetGroupId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, group, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to silence', { targetGroupId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        groupId: parseInt(targetGroupId),
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    const member = await this.get(targetGroupId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetGroupId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, group, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to ban', { targetGroupId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        groupId: parseInt(targetGroupId),
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    const member = await this.get(targetGroupId, subscriberId);

    if (!member) {
      throw new models.WOLFAPIError('Unknown Member', { targetGroupId, subscriberId });
    }

    if (!await canPerformGroupAction(this.client, group, member, Capability.ADMIN)) {
      throw new models.WOLFAPIError('Insufficient privileges to kick', { targetGroupId, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        groupId: parseInt(targetGroupId),
        id: parseInt(subscriberId)
      }
    );
  }
}

export { Member };
