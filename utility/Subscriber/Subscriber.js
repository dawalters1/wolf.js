const validator = require('../../validator');
const Privilege = require('./Privilege');

class Subscriber {
  constructor (api) {
    this._api = api;
    this._privilege = new Privilege(this._api);
  }

  /**
   * Exposes the privilege methods
   * @returns {Privilege}
   */
  privilege () {
    return this._privilege;
  }

  /**
   * Download a subscribers avatar
   * @param {Number} subscriberId - The ID of the subscriber
   * @param {Number} size - The size of the image you want to download
   * @returns {Buffer} The buffer of the image
   */
  async getAvatar (subscriberId, size) {
    return await this._api.utility().download().file(this._api.utility().string().replace(`${this._api.endpointConfig.avatarEndpoint}/FileServerSpring/subsriber/avatar/{subscriberId}?size={size}`,
      {
        subscriberId,
        size
      }));
  }

  /**
   * Convert subscriber to a displayable name string {nickname} ({subscriberId}) OR {nickname}
   * @param {Object} subscriber - The subscriber
   * @param {Boolean} trimAds - Whether or not to remove ads from the subscribers name
   * @param {Boolean} excludeId - Whether or not to display the subscribers ID
   * @returns
   */
  toDisplayName (subscriber, trimAds = true, excludeId = false) {
    if (typeof subscriber !== 'object') {
      throw new Error('subscriber must be object');
    }

    if (!Reflect.has(subscriber, 'nickname')) {
      throw new Error('subscriber must contain nickname');
    }

    if (!Reflect.has(subscriber, 'id')) {
      throw new Error('subscriber must contain id');
    }

    if (!validator.isValidBoolean(trimAds)) {
      throw new Error('trimAds must be a valid boolean');
    }

    if (!validator.isValidBoolean(excludeId)) {
      throw new Error('excludeId must be a valid boolean');
    }

    return `${trimAds ? this._api.utility().string().trimAds(subscriber.nickname) : subscriber.nickname}${excludeId ? '' : ` (${subscriber.id})`}`;
  }

  /**
   * Check to see if a subscriber has a specific charm or charms
   * @param {Number} subscriberId - The id of the subscriber
   * @param {Number|Array.<Number>} charmIds - The id of the charm or charms
   * @param {Boolean} requiresAll - Whether or not the subscriber should have all the charm ids provided
   * @returns {Boolean}
   */
  async hasCharm (subscriberId, charmIds, requiresAll = false) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    charmIds = Array.isArray(charmIds) ? charmIds : [charmIds];

    for (const charmId of charmIds) {
      if (!validator.isValidNumber(charmId)) {
        throw new Error('charmId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(charmId)) {
        throw new Error('charmId cannot be less than or equal to 0');
      }
    }

    const subscriber = await this._api.subscriber().getById(subscriberId);

    if (!subscriber.exists) {
      return false;
    }

    // Check to see if the charm is selected before requesting the summary
    if ((!requiresAll || charmIds.length === 1) && subscriber.charms && subscriber.charms.selectedList && subscriber.charms.selectedList.some((selected) => charmIds.includes(selected.charmId))) {
      return true;
    }

    const summary = subscriber.charmIds || ((await this._api.charm().getSubscriberSummary(subscriberId)).body || []).map((charm) => charm.charmId);

    subscriber.charmIds = summary;

    if (summary.length === 0) {
      return false;
    }

    return requiresAll ? charmIds.every((id) => summary.includes(id)) : charmIds.some((id) => summary.includes(id));
  }
}

module.exports = Subscriber;
