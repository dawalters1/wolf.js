'use strict';

// Node dependencies

// 3rd Party Dependencies
import { StatusCodes } from 'http-status-codes';
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import structures from '../../structures/index.js';
import DataManager from '../../managers/DataManager.js';
// Variables
import { Command } from '../../constants/index.js';

class Charm extends Base {
  constructor (client) {
    super(client);

    this._charms = new DataManager();
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

  async getByIds (charmIds, languageId, forceNew = false) {
    charmIds = charmIds.map((id) => Number(id) || id);
    languageId = Number(languageId) || languageId;

    { // eslint-disable-line no-lone-blocks
      // TODO: validate charmIds
      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Charm.getByIds() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    const charms = forceNew
      ? []
      : charmIds.map((charmId) => this._charms.get(charmId))
        .filter((charm) => charm?._hasLanguage(languageId));

    if (charms.length === charmIds.length) { return charms; }

    const idList = charmIds.filter((id) => !charms.some((charm) => charm.id === id));

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
          ? this._charms._add(new structures.Charm(this.client, subResponse.body, languageId))
          : new structures.Charm(this.client, { id: idList[index] })
      )
    );

    return charmIds.map((id) =>
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

    const user = await this.client.user.getById(userId);

    if (!user.exists) { throw new Error('No such user exists'); }

    if (!forceNew && user.charmSummary._fetched) {
      return user.charmSummary.cache.values();
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

      user.charmSummary._fetched = true;

      return response.body.map((charmSummary) =>
        new structures.CharmUserSummary(this.client, charmSummary)
      );
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

    const user = await this.client.user.getById(userId);

    if (!user.exists) { throw new Error('No such user exists'); }

    if (!forceNew && user.charmStatistics) {
      return user.charmStatistics;
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

      user.charmStatistics = new structures.CharmUserSummary(this.client, response.body);

      return user.charmStatistics;
    } catch (error) {
      // handle codes
      if (error.code === StatusCodes.NOT_FOUND) { return null; }

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

    const user = await this.client.user.getById(userId);

    if (!user.exists) { throw new Error('No such user exists'); }

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
