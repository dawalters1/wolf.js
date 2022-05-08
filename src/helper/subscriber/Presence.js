const Base = require('../Base');
const { Command } = require('../../constants');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');

const models = require('../../models');

const _ = require('lodash');

class Presence extends Base {
  constructor (client) {
    super(client);

    this.presence = [];
  }

  async getById (id, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new WOLFAPIError('id cannot be null or undefined', id);
    } else if (!validator.isValidNumber(id)) {
      throw new WOLFAPIError('id must be a valid number', id);
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new WOLFAPIError('id cannot be less than or equal to 0', id);
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', forceNew);
    }

    return (await this.getByIds([id]))[0];
  }

  async getByIds (ids, forceNew = false) {
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

    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', forceNew);
    }

    const presence = !forceNew ? this.presence.filter((subscriber) => ids.includes(subscriber.id)) : [];

    if (presence.length !== ids.length) {
      const idLists = _.chunk(ids.filter((subscriberId) => !presence.some((subscriber) => subscriber.id === subscriberId), this.client.config.get('batching.length')));

      for (const idList of idLists) {
        const response = await this.client.websocket.emit(
          Command.SUBSCRIBER_PRESENCE,
          {
            idList,
            subscribe: true
          }
        );

        if (response.success) {
          const presenceResponses = Object.values(response.body).map((presenceResponse) => new Response(presenceResponse));

          for (const [index, presenceResponse] of presenceResponses.entries()) {
            presence.push(presenceResponse.success ? this._process(new models.Presence(this.client, presenceResponse.body)) : new models.Presence(this.client, { id: idList[index] }));
          }
        } else {
          presence.push(...idList.map((id) => new models.Presence(this.client, { id })));
        }
      }
    }

    return presence;
  }

  _process (value) {
    const existing = this.presence.find((subscriber) => subscriber.id === value);

    if (existing) {
      this._patch(existing, value);
    } else {
      this.presence.push(value);
    }

    return value;
  }
}

module.exports = Presence;
