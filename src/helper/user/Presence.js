'use strict';

// Node dependencies

// 3rd Party Dependencies
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import UserPresenceCache from '../../cache/UserPresenceCache.js';
import structures from '../../structures/index.js';
// Variables
import { Command } from '../../constants/index.js';

class Presence extends Base {
  constructor (client) {
    super(client);

    this.userPresenceCache = new UserPresenceCache();
  }

  async getById (userId, forceNew = false) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(userId)) {
        throw new Error(`Presence.getById() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Presence.getById() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Presence.getById() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    return (await this.getByIds([userId], forceNew))[0];
  }

  async getByIds (userIds, forceNew = false) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      if (!userIds.length) {
        throw new Error(`Presence.getByIds() parameter, userIds: ${JSON.stringify(userIds)}, cannot be an empty array`);
      } else if ([...new Set(userIds)].length !== userIds.length) {
        throw new Error(`Presence.getByIds() parameter, userIds: ${JSON.stringify(userIds)}, cannot contain duplicate ids`);
      } else {
        userIds.forEach((userId, index) => {
          if (!verify.isValidNumber(userId)) {
            throw new Error(`Presence.getByIds() parameter, userIds[${index}]: ${JSON.stringify(userId)}, is not a valid number`);
          } else if (verify.isLessThanOrEqualZero(userId)) {
            throw new Error(`Presence.getByIds() parameter, userIds[${index}]: ${JSON.stringify(userId)}, is zero or negative`);
          }
        });
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Presence.getByIds() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    const presence = forceNew
      ? []
      : this.userPresenceCache.get(userIds)
        .filter(Boolean);
  }
}

export default Presence;
