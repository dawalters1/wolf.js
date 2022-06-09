const Base = require('../Base');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');
const { Command } = require('../../constants');

const models = require('../../models');

const _ = require('lodash');
const Group = require('./Group');
const Subscription = require('./Subscription');

class Event extends Base {
  constructor (client) {
    super(client);

    this.group = new Group(this.client);
    this.subscription = new Subscription(this.client);
  }

  async getById (id, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    return (await this.getByIds([id], forceNew))[0];
  }

  async getByIds (ids, forceNew = false) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!ids.length) {
      throw new WOLFAPIError('ids cannot be null or empty', { ids });
    }

    if ([...new Set(ids)].length !== ids.length) {
      throw new WOLFAPIError('ids cannot contain duplicates', { ids });
    }

    for (const id of ids) {
      if (validator.isNullOrUndefined(id)) {
        throw new WOLFAPIError('id cannot be null or undefined', { id });
      } else if (!validator.isValidNumber(id)) {
        throw new WOLFAPIError('id must be a valid number', { id });
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new WOLFAPIError('id cannot be less than or equal to 0', { id });
      }
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const events = !forceNew ? this.cache.filter((event) => ids.includes(event.id)) : [];

    if (events.length !== ids.length) {
      const idLists = _.chunk(ids.filter((eventId) => !events.some((event) => event.id === eventId), this.client._botConfig.get('batching.length')));

      for (const idList of idLists) {
        const response = await this.client.websocket.emit(
          Command.GROUP_EVENT,
          {
            headers: {
              version: 1
            },
            body: {
              idList
            }
          }
        );

        if (response.success) {
          const eventResponses = Object.values(response.body).map((eventResponse) => new Response(eventResponse));

          for (const [index, eventResponse] of eventResponses.entries()) {
            events.push(eventResponse.success ? this._process(new models.Event(this.client, eventResponse.body)) : new models.Event(this.client, { id: idList[index] }));
          }
        } else {
          events.push(...idList.map((id) => new models.Event(this.client, { id })));
        }
      }
    }

    return events;
  }
}

module.exports = Event;
