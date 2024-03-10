import Base from '../Base.js';
import { Command } from '../../constants/index.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';
import _ from 'lodash';
import patch from '../../utils/patch.js';

class Presence extends Base {
  constructor (client) {
    super(client);

    this.presences = [];
  }

  /**
   * Get a subscriber presence
   * @param {Number} id
   * @param {Boolean} forceNew
   * @returns {Promise<Presence>}
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

    return (await this.getByIds([id]))[0];
  }

  /**
   * Get subscribers presences
   * @param {Number | Number[]} ids
   * @param {Boolean} subscribe
   * @param {Boolean} forceNew
   * @returns {Promise<Presence|Array<Presence>>}
   */
  async getByIds (ids, subscribe = true, forceNew = false) {
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

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const presence = forceNew ? [] : this.presences.filter((subscriber) => ids.includes(subscriber.id));

    if (presence.length === ids.length) {
      return presence;
    }

    const idLists = _.chunk(ids.filter((subscriberId) => !presence.some((subscriber) => subscriber.id === subscriberId)), this.client._frameworkConfig.get('batching.length'));

    for (const idList of idLists) {
      const response = await this.client.websocket.emit(
        Command.SUBSCRIBER_PRESENCE,
        {
          idList,
          subscribe
        }
      );

      if (response.success) {
        presence.push(...Object.values(response.body)
          .map((presenceResponse) => new models.Response(presenceResponse))
          .map((presenceResponse, index) =>
            presenceResponse.success
              ? this._process(new models.Presence(this.client, presenceResponse.body))
              : new models.Presence(this.client, { id: idList[index] })
          )
        );
      } else {
        presence.push(...idList.map((id) => new models.Presence(this.client, { id })));
      }
    }

    return presence;
  }

  _process (value) {
    const existing = this.presences.find((subscriber) => subscriber.id === value.id);

    existing ? patch(existing, value) : this.presences.push(value);

    return value;
  }

  _cleanUp (reconnection = false) {
    this.presences = [];
  }
}

export default Presence;
