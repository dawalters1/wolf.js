import models from '../../models/index.js';
import { Command } from '../../constants/index.js';
import Base from '../Base.js';
import validator from '../../validator/index.js';
import _ from 'lodash';

class Charm extends Base {
  constructor (client) {
    super(client);

    this.charms = {};
  }

  /**
   * Request a charm by ID
   * @param {Number} id - The ID of the charm
   * @returns {Promise<models.Charm>} - The requested charm
   */
  async getById (id, language, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    return (await this.getByIds([id], language, forceNew))[0];
  }

  /**
   * Request multiple charms by ID
   * @param {Number | Number[]} ids - The IDs of the charm
   * @returns {Promise<Array<models.Charm>>} - The requested charms
   */
  async getByIds (ids, language, forceNew = false) {
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

     const charms = forceNew
          ? []
          : this.charms[language]?.filter((charm) =>
            ids.includes(charm.id)
          ) ?? [];
    
        if (charms.length === ids.length) {
          return charms;
        }
    
        const idLists = _.chunk(
          ids.filter(
            (achievementId) => !charms.some((charm) => charm.id === achievementId)
          ),
          this.client._frameworkConfig.get('batching.length')
        );
    
        for (const idList of idLists) {
          const response = await this.client.websocket.emit(
            Command.CHARM_LIST,
            {
              body: {
                idList,
                languageId: parseInt(language)
              }
            }
          );
    
          if (response.success) {
            charms.push(...Object.values(response.body)
              .map((charmResponse) => new models.Response(charmResponse))
              .map((charmResponse, index) =>
                charmResponse.success
                  ? this._process(new models.Charm(this.client, charmResponse.body), language)
                  : new models.Charm(this.client, { id: idList[index] }
                  )
              )
            );
          } else {
            charms.push(...idList.map((id) => new models.Achievement(this.client, { id })));
          }
        }
    
        return charms;
  }

  /**
   * Request a subscribers charm summary
   * @param {Number} subscriberId - The ID of the subscriber
   * @returns {Promise<models.CharmSummary>} - The charm summary of a subscriber
   */
  async getSubscriberSummary (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const response = await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_SUMMARY_LIST,
      {
        id: parseInt(subscriberId)
      }
    );

    return response.body?.map((charmSummary) => new models.CharmSummary(this.client, charmSummary)) ?? [];
  }

  /**
   * Request a subscribers charm statistics
   * @param {Number} subscriberId - The ID of the subscriber
   * @returns {Promise<models.CharmStatistics>} - The charm statistics of a subscriber
   */
  async getSubscriberStatistics (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const response = await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_STATISTICS,
      {
        id: parseInt(subscriberId)
      }
    );

    return response.success ? new models.CharmStatistics(this.client, response.body) : undefined;
  }

  /**
   * Request a subscribers active charms list
   * @param {Number} subscriberId - The ID of the subscriber
   * @param {Number} limit - How many charms to request
   * @param {Number} offset - Where in the list to start
   * @returns {Promise<Array<models.CharmExpiry>>} - The list of active charms
   */
  async getSubscriberActiveList (subscriberId, limit = 25, offset = 0) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new models.WOLFAPIError('limit cannot be null or undefined', { limit });
    } else if (!validator.isValidNumber(limit)) {
      throw new models.WOLFAPIError('limit must be a valid number', { limit });
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new models.WOLFAPIError('limit cannot be less than or equal to 0', { limit });
    }

    if (validator.isNullOrUndefined(offset)) {
      throw new models.WOLFAPIError('offset cannot be null or undefined', { offset });
    } else if (!validator.isValidNumber(offset)) {
      throw new models.WOLFAPIError('offset must be a valid number', { offset });
    } else if (validator.isLessThanZero(offset)) {
      throw new models.WOLFAPIError('offset cannot be less than 0', { offset });
    }

    const response = await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_ACTIVE_LIST,
      {
        id: parseInt(subscriberId),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    );

    return response.body?.map((charm) => new models.CharmExpiry(this.client, charm)) ?? [];
  }

  /**
   * Request a subscribers expired charms list
   * @param {Number} subscriberId - The ID of the subscriber
   * @param {Number} limit - How many charms to request
   * @param {Number} offset - Where in the list to start
   * @returns {Promise<Array<models.CharmExpiry>>} - The list of expired charms
   */
  async getSubscriberExpiredList (subscriberId, limit = 25, offset = 0) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new models.WOLFAPIError('limit cannot be null or undefined', { limit });
    } else if (!validator.isValidNumber(limit)) {
      throw new models.WOLFAPIError('limit must be a valid number', { limit });
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new models.WOLFAPIError('limit cannot be less than or equal to 0', { limit });
    }

    if (validator.isNullOrUndefined(offset)) {
      throw new models.WOLFAPIError('offset cannot be null or undefined', { offset });
    } else if (!validator.isValidNumber(offset)) {
      throw new models.WOLFAPIError('offset must be a valid number', { offset });
    } else if (validator.isLessThanZero(offset)) {
      throw new models.WOLFAPIError('offset cannot be less than 0', { offset });
    }

    const response = await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_EXPIRED_LIST,
      {
        id: parseInt(subscriberId),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    );

    return response.body?.map((charm) => new models.CharmExpiry(this.client, charm)) ?? [];
  }

  /**
   * Request a subscribers expired charms list
   * @param {Number} subscriberId - The ID of the subscriber
   * @returns {Promise<models.SubscriberSelectedCharm>} - The list of expired charms
   */
  async getSubscriberSelectedList (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const response = await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_SELECTED_LIST,
      {
        id: subscriberId
      }
    );

    return new models.SubscriberSelectedCharm(this.client, response.body ? response.body[subscriberId] : null);
  }

  /**
   * Delete owned charms
   * @param {Number|Number[]} charmIds - The ID or IDs of the charms to delete
   * @returns {Promise<models.Response>} - Response
   */
  async delete (charmIds) {
    charmIds = (Array.isArray(charmIds) ? charmIds : [charmIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!charmIds.length) {
      throw new models.WOLFAPIError('charmIds cannot be null or empty', { charmIds });
    }

    if ([...new Set(charmIds)].length !== charmIds.length) {
      throw new models.WOLFAPIError('charmIds cannot contain duplicates', { charmIds });
    }

    for (const subscriberId of charmIds) {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
      }
    }

    return await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_DELETE,
      {
        idList: charmIds
      }
    );
  }

  /**
   * Set selected charms
   * @param {builders.CharmSelectedBuilder} charms - The charm to set
   * @returns {Promise<models.Response>} - Response
   */
  async set (charms) {
    charms = (Array.isArray(charms) ? charms : [charms]).map((charm) => new models.CharmSelected(this.client, charm.toCharmSelected()));

    if ([...new Set(charms.map((charm) => charm.toJSON()))].length !== charms.length) {
      throw new models.WOLFAPIError('charms cannot contain duplicates', { charms });
    }
    charms.forEach((charm) => charm.validate());

    return await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_SET_SELECTED,
      {
        selectedList: charms
      }
    );
  }

  _process (value, language) {
    if (!this.charms[language]) {
      this.charms[language] = [];
    }

    (Array.isArray(value) ? value : [value]).forEach((charm) => {
      const existing = this.charms[language].find((cached) => charm.id === cached.id);

      existing ? patch(existing, value) : this.charms[language].push(value);
    });

    return value;
  }

  _cleanUp (reconnection = false) {
    if (reconnection) { return false; }

    this.charms = {};
  }
}

export default Charm;
