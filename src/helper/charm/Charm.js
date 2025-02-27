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

class Charm extends Base {
  constructor (client) {
    super(client);

    this.charmsCache = new CharmCache();
    this.charmSummaryCache = new CharmSummaryCache();
    this.charmStatisticsCham = new CharmStatisticsCache();

    this.fetched = false;
  }

  // TODO: Potentially deprecated, only returns 50?
  async list (forceNew = false) {
    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Achievement.getById() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
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
        throw new Error(`Achievement.getById() parameter, charmId: ${JSON.stringify(charmId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(charmId)) {
        throw new Error(`Achievement.getById() parameter, charmId: ${JSON.stringify(charmId)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Achievement.getById() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    return (await this.getByIds([charmId], forceNew))[0];
  }

  async getByIds (ids, forceNew = false) {
    ids = ids.map((id) => Number(id) || id);

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Achievement.getById() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
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
        throw new Error(`Achievement.getById() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Achievement.getById() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Achievement.getById() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
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

      return this.set(userId, response.body.map((charmUserSummary) => new structures.CharmUserSummary(this.client, charmUserSummary)));
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
        throw new Error(`Achievement.getById() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Achievement.getById() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Achievement.getById() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
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
            id: userId
          }
        }
      );

      return this.cache.summaries.set(new structures.CharmUserSummary(this.client, response.body));
    } catch (error) {
      // handle codes
      if (error.code === StatusCodes.NOT_FOUND) { return []; }

      throw error;
    }
  }
}

export default Charm;
