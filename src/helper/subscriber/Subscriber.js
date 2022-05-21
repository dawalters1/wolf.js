const Base = require('../Base');
const { Command } = require('../../constants');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');

const models = require('../../models');

const _ = require('lodash');

const Presence = require('./Presence');

class Subscriber extends Base {
  constructor (client) {
    super(client);

    this.presence = new Presence(this.client);
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

    const subscribers = !forceNew ? this.cache.filter((subscriber) => ids.includes(subscriber.id)) : [];

    if (subscribers.length !== ids.length) {
      const idLists = _.chunk(ids.filter((subscriberId) => !subscribers.some((subscriber) => subscriber.id === subscriberId), this.client.config.get('batching.length')));

      for (const idList of idLists) {
        const response = await this.client.websocket.emit(
          Command.SUBSCRIBER_PROFILE,
          {
            headers: {
              version: 4
            },
            body: {
              idList,
              extended: true,
              subscribe: true
            }
          }
        );

        if (response.success) {
          const groupResponses = Object.values(response.body).map((subscriberResponse) => new Response(subscriberResponse));

          for (const [index, subscriberResponse] of groupResponses.entries()) {
            subscribers.push(subscriberResponse.success ? this._process(new models.Subscriber(this.client, subscriberResponse.body)) : new models.Subscriber(this.client, { id: idList[index] }));
          }
        } else {
          subscribers.push(...idList.map((id) => new models.Subscriber(this.client, { id })));
        }
      }
    }

    return subscribers;
  }

  async getChatHistory (id, timestamp = 0, limit = 15) {
    if (validator.isNullOrUndefined(id)) {
      throw new WOLFAPIError('id cannot be null or undefined', id);
    } else if (!validator.isValidNumber(id)) {
      throw new WOLFAPIError('id must be a valid number', id);
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new WOLFAPIError('id cannot be less than or equal to 0', id);
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be null or undefined', timestamp);
    } else if (!validator.isValidNumber(timestamp)) {
      throw new WOLFAPIError('timestamp must be a valid number', timestamp);
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be less than or equal to 0', timestamp);
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new WOLFAPIError('limit cannot be null or undefined', limit);
    } else if (!validator.isValidNumber(limit)) {
      throw new WOLFAPIError('limit must be a valid number', limit);
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new WOLFAPIError('limit cannot be less than or equal to 0', limit);
    }

    const response = await this.client.websocket.emit(
      Command.MESSAGE_GROUP_HISTORY_LIST,
      {
        headers: {
          version: 2
        },
        body: {
          id: parseInt(id),
          limit: parseInt(limit),
          timestampEnd: timestamp === 0 ? undefined : parseInt(timestamp)
        }
      }
    );

    return response.success ? response.body.map((message) => new models.Message(this.client, message)) : [];
  }

  _process (value) {
    const existing = this.cache.find((subscriber) => subscriber.id === value);

    if (existing) {
      this._patch(existing, value);
    } else {
      this.cache.push(value);
    }

    return value;
  }
}

module.exports = Subscriber;
