import BaseHelper from '../baseHelper.js';
import ChannelRole from '../../entities/channelRole.js';
import ChannelRoleUser from '../../entities/channelRoleUser.js';
import { Command } from '../../constants/Command.js';
import { validate } from '../../validator/index.js';

class ChannelRoleHelper extends BaseHelper {
  async roles (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelRoleHelper.roles() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelRoleHelper.roles() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelRoleHelper.roles() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'ChannelRoleHelper.roles() parameter, opts.{parameter}: {value} {error}');
    }
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} Not Found`); }

    if (!opts?.forceNew && channel.roleStore.users.fetched) {
      return channel.roleStore.users.values();
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_ROLE_SUMMARY,
      {
        body: {
          groupId: channelId
        }
      }
    );

    return response.body.map(
      (serverGroupRole) =>
        channel.roleStore.users.set(
          new ChannelRole(this.client, serverGroupRole)
        )
    );
  }

  async users (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelRoleHelper.users() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelRoleHelper.users() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelRoleHelper.users() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'ChannelRoleHelper.users() parameter, opts.{parameter}: {value} {error}');
    }
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} Not Found`); }

    if (!opts?.forceNew && channel.roleStore.users.fetched) {
      return channel.roleStore.users.values();
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

    return response.body.map(
      (serverGroupRoleUser) => {
        serverGroupRoleUser.groupId = channelId;

        return channel.roleStore.users.set(
          new ChannelRoleUser(this.client, serverGroupRoleUser)
        );
      }
    );
  }

  async assign (channelId, userId, roleId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;
    roleId = Number(roleId) || roleId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelRoleHelper.assign() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelRoleHelper.assign() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelRoleHelper.assign() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(userId)
        .isNotNullOrUndefined(`ChannelRoleHelper.assign() parameter, channelId: ${userId} is null or undefined`)
        .isValidNumber(`ChannelRoleHelper.assign() parameter, channelId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ChannelRoleHelper.assign() parameter, channelId: ${userId} is less than or equal to zero`);

      validate(roleId)
        .isNotNullOrUndefined(`ChannelRoleHelper.assign() parameter, channelId: ${roleId} is null or undefined`)
        .isValidNumber(`ChannelRoleHelper.assign() parameter, channelId: ${roleId} is not a valid number`)
        .isGreaterThan(0, `ChannelRoleHelper.assign() parameter, channelId: ${roleId} is less than or equal to zero`);
    }
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} Not Found`); }
    if (!channel.isOwner) { throw new Error('Bot must be owner of channel to assign roles'); }

    const member = await this.client.channel.member.getMember(channelId, userId);

    if (member === null) { throw new Error(`Member with ID ${userId} Not Found`); }

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
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;
    roleId = Number(roleId) || roleId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelRoleHelper.unassign() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelRoleHelper.unassign() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelRoleHelper.unassign() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(userId)
        .isNotNullOrUndefined(`ChannelRoleHelper.unassign() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`ChannelRoleHelper.unassign() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ChannelRoleHelper.unassign() parameter, userId: ${userId} is less than or equal to zero`);

      validate(roleId)
        .isNotNullOrUndefined(`ChannelRoleHelper.unassign() parameter, roleId: ${roleId} is null or undefined`)
        .isValidNumber(`ChannelRoleHelper.unassign() parameter, roleId: ${roleId} is not a valid number`)
        .isGreaterThan(0, `ChannelRoleHelper.unassign() parameter, roleId: ${roleId} is less than or equal to zero`);
    }
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} Not Found`); }
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
    channelId = Number(channelId) || channelId;
    oldUserId = Number(oldUserId) || oldUserId;
    newUserId = Number(newUserId) || newUserId;
    roleId = Number(roleId) || roleId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelRoleHelper.reassign() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelRoleHelper.reassign() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelRoleHelper.reassign() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(oldUserId)
        .isNotNullOrUndefined(`ChannelRoleHelper.reassign() parameter, oldUserId: ${oldUserId} is null or undefined`)
        .isValidNumber(`ChannelRoleHelper.reassign() parameter, oldUserId: ${oldUserId} is not a valid number`)
        .isGreaterThan(0, `ChannelRoleHelper.reassign() parameter, oldUserId: ${oldUserId} is less than or equal to zero`);

      validate(newUserId)
        .isNotNullOrUndefined(`ChannelRoleHelper.reassign() parameter, newUserId: ${newUserId} is null or undefined`)
        .isValidNumber(`ChannelRoleHelper.reassign() parameter, newUserId: ${newUserId} is not a valid number`)
        .isGreaterThan(0, `ChannelRoleHelper.reassign() parameter, newUserId: ${newUserId} is less than or equal to zero`);

      validate(roleId)
        .isNotNullOrUndefined(`ChannelRoleHelper.reassign() parameter, roleId: ${roleId} is null or undefined`)
        .isValidNumber(`ChannelRoleHelper.reassign() parameter, roleId: ${roleId} is not a valid number`)
        .isGreaterThan(0, `ChannelRoleHelper.reassign() parameter, roleId: ${roleId} is less than or equal to zero`);
    }
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} Not Found`); }
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
