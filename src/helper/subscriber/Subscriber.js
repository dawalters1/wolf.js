import Base from '../Base.js';
import { Command } from '../../constants/index.js';
import validator from '../../validator/index.js';
import models, { Search } from '../../models/index.js';
import _ from 'lodash';
import Presence from './Presence.js';
import patch from '../../utils/patch.js';

class Subscriber extends Base {
  constructor (client) {
    super(client);
    this.subscribers = [];
    this.presence = new Presence(this.client);
  }

  async getById (id, subscribe = true, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    return (await this.getByIds([id], subscribe, forceNew))[0];
  }

  async getByIds (ids, subscribe = true, forceNew = false) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!ids.length) {
      throw new models.WOLFAPIError('ids cannot be null or empty', { ids });
    }

    if ([...new Set(ids)].length !== ids.length) {
      throw new models.WOLFAPIError('ids cannot contain duplicates', { ids });
    }

    for (const id of ids) {
      if (validator.isNullOrUndefined(id)) {
        throw new models.WOLFAPIError('id cannot be null or undefined', { id });
      } else if (!validator.isValidNumber(id)) {
        throw new models.WOLFAPIError('id must be a valid number', { id });
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
      }
    }

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const subscribers = !forceNew ? this.subscribers.filter((subscriber) => ids.includes(subscriber.id)) : [];

    if (subscribers.length !== ids.length) {
      const idLists = _.chunk(ids.filter((subscriberId) => !subscribers.some((subscriber) => subscriber.id === subscriberId)), this.client._botConfig.get('batching.length'));

      for (const idList of idLists) {
        const response = await this.client.websocket.emit(
          Command.SUBSCRIBER_PROFILE, {
            headers: {
              version: 4
            },
            body: {
              idList,
              extended: true,
              subscribe
            }
          }
        );

        if (response.success) {
          const groupResponses = Object.values(response.body).map((subscriberResponse) => new models.Response(subscriberResponse));

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
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be null or undefined', { timestamp });
    } else if (!validator.isValidNumber(timestamp)) {
      throw new models.WOLFAPIError('timestamp must be a valid number', { timestamp });
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be less than or equal to 0', { timestamp });
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new models.WOLFAPIError('limit cannot be null or undefined', { limit });
    } else if (!validator.isValidNumber(limit)) {
      throw new models.WOLFAPIError('limit must be a valid number', { limit });
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new models.WOLFAPIError('limit cannot be less than or equal to 0', { limit });
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

    return response.body?.map((message) => new models.Message(this.client, message)) ?? [];
  }

  async search (query) {
    if (validator.isNullOrUndefined(query)) {
      throw new models.WOLFAPIError('query cannot be null or undefined', { query });
    } else if (validator.isNullOrWhitespace(query)) {
      throw new models.WOLFAPIError('query cannot be null or empty', { query });
    }

    const response = await this.client.websocket.emit(
      Command.SEARCH,
      {
        query,
        types: ['related']
      }
    );

    return response.body?.map((result) => new Search(this.client, result)) ?? [];
  }

  _process (value) {
    const existing = this.subscribers.find((subscriber) => subscriber.id === value);

    existing ? patch(existing, value) : this.subscribers.push(value);

    if (value.id === this.client.currentSubscriber.id) {
      this.client.currentSubscriber = this.subscribers.find((subscriber) => subscriber.id === this.client.currentSubscriber.id);
    }

    return value;
  }

  _cleanUp (reconnection = false) {
    this.subscribers = [];
    this.presence._cleanUp(reconnection);
  }
}

export default Subscriber;
