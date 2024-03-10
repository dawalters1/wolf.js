import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command } from '../../constants/index.js';
import models from '../../models/index.js';
import _ from 'lodash';
import Channel from './Channel.js';
import Subscription from './Subscription.js';
import patch from '../../utils/patch.js';

class Event extends Base {
  constructor (client) {
    super(client);
    this.channel = new Channel(this.client);
    this.group = this.channel;
    this.subscription = new Subscription(this.client);
    this.events = [];
  }

  /**
   * Get an event
   * @param {Number} id
   * @param {Boolean} forceNew
   * @returns {Promise<Event>}
   */
  async getById (id, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    return (await this.getByIds([id], forceNew))[0];
  }

  /**
   * Get events
   * @param {Number | Number[]} ids
   * @param {Boolean} forceNew
   * @returns {Promise<Event | Array<Event>>}
   */
  async getByIds (ids, forceNew = false) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!ids.length) {
      return [];
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

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const events = forceNew ? [] : this.events.filter((event) => ids.includes(event.id));

    if (events.length === ids.length) {
      return events;
    }

    const idLists = _.chunk(ids.filter((eventId) => !events.some((event) => event.id === eventId)), this.client._frameworkConfig.get('batching.length'));

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
        events.push(...Object.values(response.body)
          .map((eventResponse) => new models.Response(eventResponse))
          .map((eventResponse, index) =>
            eventResponse.success
              ? this._process(new models.Event(this.client, eventResponse.body))
              : new models.Event(this.client, { id: idList[index] })
          )
        )
        ;
      } else {
        events.push(...idList.map((id) => new models.Event(this.client, { id })));
      }
    }

    return events;
  }

  _process (event) {
    const existing = this.events.find((cached) => event.id === cached.id);

    existing ? patch(existing, event) : this.events.push(event);

    return event;
  }

  _cleanUp (reconnection = false) {
    this.events = [];
    this.channel._cleanUp(reconnection);
    this.subscription._cleanUp(reconnection);
  }
}

export default Event;
