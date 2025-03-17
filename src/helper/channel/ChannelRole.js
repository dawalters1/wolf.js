'use strict';

// Node dependencies

// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import structures from '../../structures/index.js';
import ChannelRoleCache from '../../cache/ChannelRoleCache.js';
// Variables
import { Command } from '../../constants/index.js';

// TODO: update to new caching approach
class ChannelRole extends Base {
  async get (channelId, forceNew = false) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`ChannelRole.get() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelRole.get() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`ChannelRole.get() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    const channel = await this.client.channel.getById(channelId);

    if (!channel.exists) { throw new Error('No such channel exists'); }

    if (!forceNew && channel.roles._fetched) {
      const cached = this.channelRoleCache.get(channelId);

      if (cached) { return cached; }
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_ROLE_SUMMARY,
      {
        body: {
          groupId: channelId
        }
      }
    );

    return this.channelRoleCache.set(channelId, response.body.map((channelRoleSummary) => new structures.ChannelRoleSummary(this.client, channelRoleSummary)));
  }

  async assign (channelId, userId, roleId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;
    roleId = Number(roleId) || roleId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`ChannelRole.assign() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelRole.assign() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(userId)) {
        throw new Error(`ChannelRole.assign() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`ChannelRole.assign() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(roleId)) {
        throw new Error(`ChannelRole.assign() parameter, roleId: ${JSON.stringify(roleId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelRole.assign() parameter, roleId: ${JSON.stringify(roleId)}, is zero or negative`);
      }
    }

    return await this.client.websocket.emit(
      Command.GROUP_ROLE_ASSIGN,
      {
        body: {
          groupId: channelId,
          subscriberId: userId,
          roleId
        }
      }
    );
  }

  async unassign (channelId, userId, roleId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;
    roleId = Number(roleId) || roleId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`ChannelRole.assign() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelRole.assign() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(userId)) {
        throw new Error(`ChannelRole.assign() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`ChannelRole.assign() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(roleId)) {
        throw new Error(`ChannelRole.assign() parameter, roleId: ${JSON.stringify(roleId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelRole.assign() parameter, roleId: ${JSON.stringify(roleId)}, is zero or negative`);
      }
    }

    return await this.client.websocket.emit(
      Command.GROUP_ROLE_UNASSIGN,
      {
        body: {
          groupId: channelId,
          subscriberId: userId,
          roleId
        }
      }
    );
  }

  async reassign (channelId, oldUserId, newUserId, roleId) {
    channelId = Number(channelId) || channelId;
    oldUserId = Number(oldUserId) || oldUserId;
    newUserId = Number(newUserId) || newUserId;
    roleId = Number(roleId) || roleId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`ChannelRole.reassign() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelRole.reassign() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(oldUserId)) {
        throw new Error(`ChannelRole.reassign() parameter, oldUserId: ${JSON.stringify(oldUserId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(oldUserId)) {
        throw new Error(`ChannelRole.reassign() parameter, oldUserId: ${JSON.stringify(oldUserId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(newUserId)) {
        throw new Error(`ChannelRole.reassign() parameter, newUserId: ${JSON.stringify(newUserId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(newUserId)) {
        throw new Error(`ChannelRole.reassign() parameter, newUserId: ${JSON.stringify(newUserId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(roleId)) {
        throw new Error(`ChannelRole.reassign() parameter, roleId: ${JSON.stringify(roleId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelRole.reassign() parameter, roleId: ${JSON.stringify(roleId)}, is zero or negative`);
      }
    }

    return await this.client.websocket.emit(
      Command.GROUP_ROLE_ASSIGN,
      {
        body: {
          groupId: channelId,
          subscriberId: newUserId,
          replaceSubscriberId: oldUserId,
          roleId
        }
      }
    );
  }
}

export default ChannelRole;
