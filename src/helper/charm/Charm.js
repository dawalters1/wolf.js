const models = require('../../models');

const { Commands } = require('../../constants');
const Base = require('../Base');

const validator = require('../../validator');

/**
 * TODO: Paramater validation
 */
class Charm extends Base {
  constructor (client) {
    super(client);

    this._charms = [];
  }

  async list () {
    if (this._charms.length) {
      return this._charms;
    }

    const response = await this.client.websocket.emit(Commands.CHARM_LIST);

    if (response.success) {
      this._charms = response.body.map((charm) => new models.Charm(this.client, charm));

      // Handle cache control - At some point need to create a utility to do this
      if (response.headers && response.headers.include('cache-control')) {
        const maxAge = parseInt(response.headers['cache-control'].replace('max-age=', '')) * 1000;

        return setTimeout(() => {
          this._charms = [];
        }, maxAge);
      }
    }

    return this._charms;
  }

  async getById (id) {
    return (await this.getByIds([id]))[0];
  }

  async getByIds (ids) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!ids.length) {
      throw new Error('ids cannot be null or empty');
    }

    if ([...new Set(ids)].length !== ids.length) {
      throw new Error('ids cannot contain duplicates');
    }

    for (const id of ids) {
      if (validator.isNullOrUndefined(id)) {
        throw new Error('id cannot be null or undefined');
      } else if (!validator.isValidNumber(id)) {
        throw new Error('id must be a valid number');
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new Error('id cannot be less than or equal to 0');
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
    const result = await this.client.websocket.emit(
      Commands.CHARM_SUBSCRIBER_SUMMARY_LIST,
      {
        id: subscriberId
      }
    );

    return result.success ? new models.CharmSubscriberSummary(this.client, result.body) : undefined;
  }

  async getSubscriberStatistics (subscriberId) {
    const result = await this.client.websocket.emit(
      Commands.CHARM_SUBSCRIBER_STATISTICS,
      {
        id: subscriberId
      }
    );

    return result.success ? new models.CharmSubscriberStatistics(this.client, result.body) : undefined;
  }

  async getSubscriberActiveList (subscriberId, limit = 25, offset = 0) {
    const result = await this.client.websocket.emit(
      Commands.CHARM_SUBSCRIBER_ACTIVE_LIST,
      {
        id: subscriberId,
        limit,
        offset
      }
    );

    return result.success ? result.body.map((charm) => new models.CharmActive(this.client, charm)) : [];
  }

  async getSubscriberExpiredList (subscriberId, limit = 25, offset = 0) {
    const result = await this.client.websocket.emit(
      Commands.CHARM_SUBSCRIBER_EXPIRED_LIST,
      {
        id: subscriberId,
        limit,
        offset
      }
    );

    return result.success ? result.body.map((charm) => new models.CharmExpired(this.client, charm)) : [];
  }

  async delete (charmIds) {
    charmIds = Array.isArray(charmIds) ? charmIds : [charmIds];

    return await this.client.websocket.emit(
      Commands.CHARM_SUBSCRIBER_DELETE,
      {
        idList: charmIds
      }
    );
  }

  async set (charms) {
    charms = Array.isArray(charms) ? charms : [charms];

    return await this.client.websocket.emit(
      Commands.CHARM_SUBSCRIBER_SET_SELECTED,
      {
        selectedList: charms
      }
    );
  }
}

module.exports = Charm;
