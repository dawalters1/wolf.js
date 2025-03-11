'use strict';

// Node dependencies

// 3rd Party Dependencies
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import WOLFStarCache from '../../cache/WOLFStarCache.js';
import structures from '../../structures/index.js';
// Variables
import { Command } from '../../constants/index.js';

class WOLFStar extends Base {
  constructor (client) {
    super(client);

    this.wolfStarCache = new WOLFStarCache();
  }

  async getById (userId, forceNew = false) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(userId)) {
        throw new Error(`WOLFStar.getById() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`WOLFStar.getById() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`WOLFStar.getById() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    return (await this.getByIds([userId], forceNew))[0];
  }

  async getByIds (userIds, forceNew = false) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      if (!userIds.length) {
        throw new Error(`WOLFStar.getByIds() parameter, userIds: ${JSON.stringify(userIds)}, cannot be an empty array`);
      } else if ([...new Set(userIds)].length !== userIds.length) {
        throw new Error(`WOLFStar.getByIds() parameter, userIds: ${JSON.stringify(userIds)}, cannot contain duplicate ids`);
      } else {
        userIds.forEach((userId, index) => {
          if (!verify.isValidNumber(userId)) {
            throw new Error(`WOLFStar.getByIds() parameter, userIds[${index}]: ${JSON.stringify(userId)}, is not a valid number`);
          } else if (verify.isLessThanOrEqualZero(userId)) {
            throw new Error(`WOLFStar.getByIds() parameter, userIds[${index}]: ${JSON.stringify(userId)}, is zero or negative`);
          }
        });
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`WOLFStar.getByIds() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    const wolfstars = forceNew
      ? []
      : this.wolfStarCache.get(userIds)
        .filter(Boolean);

    if (wolfstars.length === userIds.length) { return wolfstars; }

    const wolfstarIds = wolfstars.map((wolfstar) => wolfstar.userId);
    const idList = userIds.filter((id) => !wolfstarIds.includes(id));

    const response = await this.client.websocket.emit(
      Command.WOLFSTAR_PROFILE,
      {
        headers: { version: 2 },
        body: {
          idList
        }
      }
    );

    response.body.forEach((subResponse, index) =>
      wolfstars.push(
        subResponse.success
          ? this.cache.set(new structures.WOLFStar(this.client, subResponse.body))
          : new structures.WOLFStar(this.client, { userId: idList[index] })
      )
    );

    // Sort to match ids order
    return userIds
      .map((userId) =>
        wolfstars.find((wolfstar) => wolfstar.userId === userId)
      );
  }
}

export default WOLFStar;
