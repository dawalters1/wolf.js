'use strict';

// Node dependencies

// 3rd Party Dependencies
import { StatusCodes } from 'http-status-codes';
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import structures from '../../structures/index.js';
import CharmCache from '../../cache/CharmCache.js';
import CharmSummaryCache from '../../cache/CharmSummaryCache.js';
import CharmStatisticsCache from '../../cache/CharmStatisticsCache.js';
// Variables
import { Command } from '../../constants/index.js';
import CharmExpiryCache from '../../cache/CharmExpiryCache.js';

class Charm extends Base {
  constructor (client) {
    super(client);

    this.charmsCache = new CharmCache();
    this.charmSummaryCache = new CharmSummaryCache();
    this.charmStatisticsCham = new CharmStatisticsCache();
    this.charmActiveCache = new CharmExpiryCache();
    this.charmsExpiredCache = new CharmExpiryCache();
    this.fetched = false;
  }

  // TODO: Potentially deprecated, only returns 50?
  async list (forceNew = false) {
    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Charm.getById() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    if (!forceNew && this.fetched) {
      return this.charmsCache.list();
    }

    const response = await this.client.websocket.emit(
      Command.CHARM_LIST,
      {
        headers: { version: 2 }
      }
    );

    this.fetched = true;

    return this.charmsCache.set(response.body.map((charm) => new structures.Charm(this.client, charm)));
  }

  async getById (charmId, forceNew = false) {
    charmId = Number(charmId) || charmId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(charmId)) {
        throw new Error(`Charm.getById() parameter, charmId: ${JSON.stringify(charmId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(charmId)) {
        throw new Error(`Charm.getById() parameter, charmId: ${JSON.stringify(charmId)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Charm.getById() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    return (await this.getByIds([charmId], forceNew))[0];
  }

  async getByIds (ids, forceNew = false) {
    ids = ids.map((id) => Number(id) || id);

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Charm.getByIds() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    const charms = forceNew
      ? []
      : this.cache.charms.get(ids)
        .filter(Boolean);

    if (charms.length === ids.length) { return charms; }

    const idList = ids.filter((id) => !charms.some((charm) => charm.id === id));

    const response = await this.client.websocket.emit(
      Command.CHARM_LIST,
      {
        headers: { version: 2 },
        body: {
          idList
        }
      }
    );

    response.body.forEach((subResponse, index) =>
      charms.push(
        subResponse.success
          ? this.cache.charms.set(new structures.Charm(this.client, subResponse.body))
          : new structures.Charm(this.client, { id: idList[index] })
      )
    );

    return ids.map((id) =>
      charms.find((charm) => charm.id === id)
    );
  }

  async getUserSummary (userId, forceNew = false) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(userId)) {
        throw new Error(`Charm.getUserSummary() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Charm.getUserSummary() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Charm.getUserSummary() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    if (!forceNew) {
      const cached = this.charmSummaryCache.get(userId);

      if (cached) { return cached; }
    }

    try {
      const response = await this.client.websocket.emit(
        Command.CHARM_SUBSCRIBER_SUMMARY,
        {
          body: {
            id: userId
          }
        }
      );

      return this.charmSummaryCache.set(userId, response.body.map((charmSummary) => new structures.CharmUserSummary(this.client, charmSummary)));
    } catch (error) {
      // handle codes
      if (error.code === StatusCodes.NOT_FOUND) { return []; }

      throw error;
    }
  }

  async getUserStatistics (userId, forceNew = false) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(userId)) {
        throw new Error(`Charm.getUserStatistics() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Charm.getUserStatistics() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Charm.getUserStatistics() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    if (!forceNew) {
      const cached = this.cache.statistics.get(userId);

      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.client.websocket.emit(
        Command.CHARM_SUBSCRIBER_STATISTICS,
        {
          body: {
            id: userId,
            extended: true
          }
        }
      );

      return this.cache.charmStatisticsCache.set(new structures.CharmUserSummary(this.client, response.body));
    } catch (error) {
      // handle codes
      if (error.code === StatusCodes.NOT_FOUND) { return []; }

      throw error;
    }
  }

  async getUserActiveCharms (userId, offset = 0, limit = 50, forceNew = false) {
    userId = Number(userId) || userId;
    offset = Number(offset) || offset;
    limit = Number(limit) || limit;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(userId)) {
        throw new Error(`Charm.getUserActiveCharms() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Charm.getUserActiveCharms() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(offset)) {
        throw new Error(`Charm.getUserActiveCharms() parameter, offset: ${JSON.stringify(offset)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(offset)) {
        throw new Error(`Charm.getUserActiveCharms() parameter, offset: ${JSON.stringify(offset)}, is zero or negative`);
      }

      if (!verify.isValidNumber(limit)) {
        throw new Error(`Charm.getUserActiveCharms() parameter, limit: ${JSON.stringify(limit)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(limit)) {
        throw new Error(`Charm.getUserActiveCharms() parameter, limit: ${JSON.stringify(limit)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Charm.getUserActiveCharms() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    // TODO:
  }

  async getUserExpiredCharms (userId, offset = 0, limit = 50, forceNew = false) {
    userId = Number(userId) || userId;
    offset = Number(offset) || offset;
    limit = Number(limit) || limit;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(userId)) {
        throw new Error(`Charm.getUserExpiredCharms() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Charm.getUserExpiredCharms() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(offset)) {
        throw new Error(`Charm.getUserExpiredCharms() parameter, offset: ${JSON.stringify(offset)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(offset)) {
        throw new Error(`Charm.getUserExpiredCharms() parameter, offset: ${JSON.stringify(offset)}, is zero or negative`);
      }

      if (!verify.isValidNumber(limit)) {
        throw new Error(`Charm.getUserExpiredCharms() parameter, limit: ${JSON.stringify(limit)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(limit)) {
        throw new Error(`Charm.getUserExpiredCharms() parameter, limit: ${JSON.stringify(limit)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Charm.getUserExpiredCharms() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    // TODO:
  }

  async getUserSelectedCharm (userId, forceNew = false) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(userId)) {
        throw new Error(`Charm.getUserSelectedCharm() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Charm.getUserSelectedCharm() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Charm.getUserSelectedCharm() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    const user = await this.client.user.getById(userId, false);

    return user?.charms?.selectedList[0] ?? null;
  }

  async set (charms) {
    charms = Array.isArray(charms) ? charms : [charms];

    { // eslint-disable-line no-lone-blocks
      charms.forEach((charm, index) => {
        if (!(charm instanceof structures.Charm)) {
          throw new Error(`Charm.set() charm[${index}], ${JSON.stringify(charm)}, is not an instance of a Charm`);
        }
      });
    }

    return await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_SET_SELECTED,
      {
        body: {
          selectedList: charms
            .map((charm, index) =>
              (
                {
                  charmId: charm.id,
                  position: index
                }
              )
            )
        }
      }
    );
  }

  async delete (charmExpiries) {
    charmExpiries = Array.isArray(charmExpiries) ? charmExpiries : [charmExpiries];

    charmExpiries.forEach((charmExpiry, index) => {
      if (!(charmExpiry instanceof structures.CharmActive) && !(charmExpiry instanceof structures.CharmExpired)) {
        throw new Error(`Charm.delete() charm[${index}], ${JSON.stringify(charmExpiry)}, is not an instance of a CharmActive or CharmExpired`);
      }
    });

    return await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_SET_SELECTED,
      {
        body: {
          idList: charmExpiries
            .map((charmExpiry) =>
              charmExpiry.id
            )
        }
      }
    );
  }
}

export default Charm;
