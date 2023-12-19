import models from '../../models/index.js';
import { Command } from '../../constants/index.js';
import Base from '../Base.js';
import validator from '../../validator/index.js';

class Charm extends Base {
  constructor (client) {
    super(client);

    this.charms = new Map();
  }

  /**
   * Request the charms list
   * @returns {Promise<Array<Charm>>} - The list of charms
   */
  async list () {
    if (this.charms.length) {
      return this.charms;
    }

    const response = await this.client.websocket.emit(Command.CHARM_LIST);

    response.body?.map((charm) =>
      this.charms.set(
        charm.id,
        new models.Charm(this.client, charm)
      )
    );

    return this.charms.values();
  }

  /**
   * Request a charm by ID
   * @param {Number} id - The ID of the charm
   * @returns {Promise<models.Charm>} - The requested charm
   */
  async getById (id) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(id)) {
        throw new models.WOLFAPIError('id cannot be null or undefined', { id });
      } else if (!validator.isValidNumber(id)) {
        throw new models.WOLFAPIError('id must be a valid number', { id });
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
      }
    }

    return (await this.getByIds([id]))[0];
  }

  /**
   * Request multiple charms by ID
   * @param {Number | Number[]} ids - The IDs of the charm
   * @returns {Promise<Array<models.Charm>>} - The requested charms
   */
  async getByIds (ids) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    { // eslint-disable-line no-lone-blocks
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
    }

    await this.list();

    return ids
      .map((id) =>
        this.charms.get(id) || new models.Charm(this.client, { id })
      );
  }

  /**
   * Request a subscribers charm summary
   * @param {Number} subscriberId - The ID of the subscriber
   * @returns {Promise<models.CharmSummary>} - The charm summary of a subscriber
   */
  async getSubscriberSummary (subscriberId) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
      }
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
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
      }
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
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
      }

      if (validator.isNullOrUndefined(limit)) {
        throw new models.WOLFAPIError('limit cannot be null or undefined', { limit });
      } else if (!validator.isValidNumber(subscriberId)) {
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
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
      }

      if (validator.isNullOrUndefined(limit)) {
        throw new models.WOLFAPIError('limit cannot be null or undefined', { limit });
      } else if (!validator.isValidNumber(subscriberId)) {
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
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
      }
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

    { // eslint-disable-line no-lone-blocks
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

    { // eslint-disable-line no-lone-blocks
      if ([...new Set(charms.map((charm) => charm.toJSON()))].length !== charms.length) {
        throw new models.WOLFAPIError('charms cannot contain duplicates', { charms });
      }
    }

    charms.forEach((charm) => charm.validate());

    return await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_SET_SELECTED,
      {
        selectedList: charms
      }
    );
  }

  _cleanUp (reconnection = false) {
    if (reconnection) { return; }

    this.charms = [];
  }
}

export default Charm;
