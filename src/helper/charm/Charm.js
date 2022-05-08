const models = require('../../models');

const { Command } = require('../../constants');
const Base = require('../Base');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');

class Charm extends Base {
  constructor (client) {
    super(client);

    this.charms = [];
  }

  async list () {
    if (this.charms.length) {
      return this.charms;
    }

    const response = await this.client.websocket.emit(Command.CHARM_LIST);

    this.charms = response.body?.map((charm) => new models.Charm(this.client, charm)) ?? [];

    return this._charms;
  }

  async getById (id) {
    if (validator.isNullOrUndefined(id)) {
      throw new WOLFAPIError('id cannot be null or undefined', id);
    } else if (!validator.isValidNumber(id)) {
      throw new WOLFAPIError('id must be a valid number', id);
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new WOLFAPIError('id cannot be less than or equal to 0', id);
    }

    return (await this.getByIds([id]))[0];
  }

  async getByIds (ids) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!ids.length) {
      throw new WOLFAPIError('ids cannot be null or empty', ids);
    }

    if ([...new Set(ids)].length !== ids.length) {
      throw new WOLFAPIError('ids cannot contain duplicates', ids);
    }

    for (const id of ids) {
      if (validator.isNullOrUndefined(id)) {
        throw new WOLFAPIError('id cannot be null or undefined', id);
      } else if (!validator.isValidNumber(id)) {
        throw new WOLFAPIError('id must be a valid number', id);
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new WOLFAPIError('id cannot be less than or equal to 0', id);
      }
    }

    const charms = await this.list();

    return ids.reduce((result, value) => {
      const charm = charms.find((charm) => charm.id === value);

      result.push(charm || new Charm({ id: value }));

      return result;
    }, []);
  }

  async getSubscriberSummary (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be null or undefined', subscriberId);
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new WOLFAPIError('subscriberId must be a valid number', subscriberId);
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', subscriberId);
    }

    const result = await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_SUMMARY_LIST,
      {
        id: parseInt(subscriberId)
      }
    );

    return result.success ? new models.CharmSubscriberSummary(this.client, result.body) : undefined;
  }

  async getSubscriberStatistics (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be null or undefined', subscriberId);
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new WOLFAPIError('subscriberId must be a valid number', subscriberId);
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', subscriberId);
    }

    const result = await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_STATISTICS,
      {
        id: parseInt(subscriberId)
      }
    );

    return result.success ? new models.CharmSubscriberStatistics(this.client, result.body) : undefined;
  }

  async getSubscriberActiveList (subscriberId, limit = 25, offset = 0) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be null or undefined', subscriberId);
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new WOLFAPIError('subscriberId must be a valid number', subscriberId);
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', subscriberId);
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new WOLFAPIError('limit cannot be null or undefined', limit);
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new WOLFAPIError('limit must be a valid number', limit);
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new WOLFAPIError('limit cannot be less than or equal to 0', limit);
    }

    if (validator.isNullOrUndefined(offset)) {
      throw new WOLFAPIError('offset cannot be null or undefined', offset);
    } else if (!validator.isValidNumber(offset)) {
      throw new WOLFAPIError('offset must be a valid number', offset);
    } else if (validator.isLessThanZero(offset)) {
      throw new WOLFAPIError('offset cannot be less than 0', offset);
    }

    const result = await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_ACTIVE_LIST,
      {
        id: parseInt(subscriberId),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    );

    return result.success ? result.body.map((charm) => new models.CharmActive(this.client, charm)) : [];
  }

  async getSubscriberExpiredList (subscriberId, limit = 25, offset = 0) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be null or undefined', subscriberId);
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new WOLFAPIError('subscriberId must be a valid number', subscriberId);
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', subscriberId);
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new WOLFAPIError('limit cannot be null or undefined', limit);
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new WOLFAPIError('limit must be a valid number', limit);
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new WOLFAPIError('limit cannot be less than or equal to 0', limit);
    }

    if (validator.isNullOrUndefined(offset)) {
      throw new WOLFAPIError('offset cannot be null or undefined', offset);
    } else if (!validator.isValidNumber(offset)) {
      throw new WOLFAPIError('offset must be a valid number', offset);
    } else if (validator.isLessThanZero(offset)) {
      throw new WOLFAPIError('offset cannot be less than 0', offset);
    }

    const result = await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_EXPIRED_LIST,
      {
        id: parseInt(subscriberId),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    );

    return result.success ? result.body.map((charm) => new models.CharmExpired(this.client, charm)) : [];
  }

  async delete (charmIds) {
    charmIds = (Array.isArray(charmIds) ? charmIds : [charmIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id); ;

    if (!charmIds.length) {
      throw new WOLFAPIError('charmIds cannot be null or empty', charmIds);
    }

    if ([...new Set(charmIds)].length !== charmIds.length) {
      throw new WOLFAPIError('charmIds cannot contain duplicates', charmIds);
    }

    for (const subscriberId of charmIds) {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be null or undefined', subscriberId);
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new WOLFAPIError('subscriberId must be a valid number', subscriberId);
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', subscriberId);
      }
    }
    return await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_DELETE,
      {
        idList: charmIds
      }
    );
  }

  async set (charms) {
    charms = Array.isArray(charms) ? charms : [charms];

    if (!charms.length) {
      throw new WOLFAPIError('charms cannot be null or empty', charms);
    }

    if ([...new Set(charms.map((charm) => JSON.stringify(charm)))].length !== charms.length) {
      throw new WOLFAPIError('charms cannot contain duplicates', charms);
    }

    for (const charm of charms) {
      if (validator.isNullOrUndefined(charm)) {
        throw new WOLFAPIError('charm cannot be null or undefined', charm);
      }

      if (!Reflect.has(charm, 'position')) {
        throw new WOLFAPIError('charm must have property position', charm);
      } else if (validator.isNullOrUndefined(charm.position)) {
        throw new WOLFAPIError('position cannot be null or undefined', charm);
      } else if (!validator.isValidNumber(charm.position)) {
        throw new WOLFAPIError('position must be a valid number', charm);
      } else if (validator.isLessThanZero(charm.position)) {
        throw new WOLFAPIError('position cannot be less than 0', charm);
      }

      if (!Reflect.has(charm, 'charmId')) {
        throw new WOLFAPIError('charm must have property charmId', charm);
      } else if (validator.isNullOrUndefined(charm.charmId)) {
        throw new WOLFAPIError('charmId cannot be null or undefined', charm);
      } else if (!validator.isValidNumber(charm.charmId)) {
        throw new WOLFAPIError('charmId must be a valid number', charm);
      } else if (validator.isLessThanOrEqualZero(charm.charmId)) {
        throw new WOLFAPIError('charmId cannot be less than or equal to 0', charm);
      }
    }

    return await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_SET_SELECTED,
      {
        selectedList: charms.map((charm) =>
          (
            {
              charmId: parseInt(charm.charmId),
              position: parseInt(charm.position)
            }
          )
        )
      }
    );
  }
}

module.exports = Charm;
