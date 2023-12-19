import Base from '../Base.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';
import { Command } from '../../constants/index.js';

class Channel extends Base {
  async list (id, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const channel = await this.client.channel.getById(id);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { id });
    }

    if (!forceNew && channel.roles._requestedRoles) {
      return channel.roles._roles;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_ROLE_SUMMARY,
      {
        groupId: parseInt(id)
      }
    );

    channel.roles._requestedRoles = true;
    channel.roles._roles = response?.body?.map((role) => new models.ChannelRole(this.client, role, channel.id)) ?? [];

    return channel.roles._roles;
  }

  async members (id, subscribe = true, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const channel = await this.client.channel.getById(id);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { id });
    }

    if (!forceNew && channel.roles._requestedMembers) {
      return channel.roles._members;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_ROLE_SUBSCRIBER_LIST,
      {
        groupId: parseInt(id),
        subscribe
      }
    );

    channel.roles._requestedMembers = true;
    channel.roles._members = response?.body?.map((roleMember) => new models.ChannelRoleMember(this.client, roleMember, channel.id)) ?? [];

    return channel.roles._members;
  }

  async assign (id, subscriberId, roleId) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    if (validator.isNullOrUndefined(roleId)) {
      throw new models.WOLFAPIError('roleId cannot be null or undefined', { roleId });
    } else if (!validator.isValidNumber(roleId)) {
      throw new models.WOLFAPIError('roleId must be a valid number', { roleId });
    } else if (validator.isLessThanOrEqualZero(roleId)) {
      throw new models.WOLFAPIError('roleId cannot be less than or equal to 0', { roleId });
    }

    const channel = await this.client.channel.getById(id);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { id });
    }

    const roles = await this.roles(id);

    if (!roles.some((role) => role.roleId === parseInt(roleId))) {
      throw new models.WOLFAPIError('Unknown channel role', { id, roleId });
    }

    if (roles.some((role) => role.subscriberIdList.includes(parseInt(subscriberId)))) {
      throw new models.WOLFAPIError('Subscriber can only hold one seat at a time', { id, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_ROLE_SUBSCRIBER_ASSIGN,
      {
        groupId: parseInt(id),
        roleId: parseInt(roleId),
        subscriberId: parseInt(subscriberId)
      }
    );
  }

  async reassign (id, oldSubscriberId, newSubscriberId, roleId) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (validator.isNullOrUndefined(oldSubscriberId)) {
      throw new models.WOLFAPIError('oldSubscriberId cannot be null or undefined', { oldSubscriberId });
    } else if (!validator.isValidNumber(oldSubscriberId)) {
      throw new models.WOLFAPIError('oldSubscriberId must be a valid number', { oldSubscriberId });
    } else if (validator.isLessThanOrEqualZero(oldSubscriberId)) {
      throw new models.WOLFAPIError('oldSubscriberId cannot be less than or equal to 0', { oldSubscriberId });
    }

    if (validator.isNullOrUndefined(newSubscriberId)) {
      throw new models.WOLFAPIError('newSubscriberId cannot be null or undefined', { newSubscriberId });
    } else if (!validator.isValidNumber(newSubscriberId)) {
      throw new models.WOLFAPIError('newSubscriberId must be a valid number', { newSubscriberId });
    } else if (validator.isLessThanOrEqualZero(newSubscriberId)) {
      throw new models.WOLFAPIError('newSubscriberId cannot be less than or equal to 0', { newSubscriberId });
    }

    if (validator.isNullOrUndefined(roleId)) {
      throw new models.WOLFAPIError('roleId cannot be null or undefined', { roleId });
    } else if (!validator.isValidNumber(roleId)) {
      throw new models.WOLFAPIError('roleId must be a valid number', { roleId });
    } else if (validator.isLessThanOrEqualZero(roleId)) {
      throw new models.WOLFAPIError('roleId cannot be less than or equal to 0', { roleId });
    }

    const channel = await this.client.channel.getById(id);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { id });
    }

    const roles = await this.roles(id);

    if (!roles.some((role) => role.roleId === parseInt(roleId))) {
      throw new models.WOLFAPIError('Unknown channel role', { id, roleId });
    }

    if (!roles.some((role) => role.roleId === parseInt(roleId) && role.subscriberIdList.includes(parseInt(oldSubscriberId)))) {
      throw new models.WOLFAPIError('Subscriber does not hold a seat', { id, roleId, oldSubscriberId });
    }

    if (roles.some((role) => role.subscriberIdList.includes(parseInt(newSubscriberId)))) {
      throw new models.WOLFAPIError('Subscriber can only hold one seat at a time', { id, newSubscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_ROLE_SUBSCRIBER_ASSIGN,
      {
        groupId: parseInt(id),
        roleId: parseInt(roleId),
        subscriberId: parseInt(oldSubscriberId),
        replaceSubscriberId: parseInt(newSubscriberId)
      }
    );
  }

  async unassign (id, subscriberId, roleId) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    if (validator.isNullOrUndefined(roleId)) {
      throw new models.WOLFAPIError('roleId cannot be null or undefined', { roleId });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('roleId must be a valid number', { roleId });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('roleId cannot be less than or equal to 0', { roleId });
    }

    const channel = await this.client.channel.getById(id);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { id });
    }

    const roles = await this.roles(id);

    if (!roles.some((role) => role.roleId === parseInt(roleId))) {
      throw new models.WOLFAPIError('Unknown channel role', { id, roleId });
    }

    if (!roles.some((role) => role.roleId === parseInt(roleId) && role.subscriberIdList.includes(parseInt(subscriberId)))) {
      throw new models.WOLFAPIError('Subscriber does not hold seat', { id, subscriberId, roleId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_ROLE_SUBSCRIBER_UNASSIGN,
      {
        groupId: parseInt(id),
        roleId: parseInt(roleId),
        subscriberId: parseInt(subscriberId)
      }
    );
  }
}

export default Channel;
