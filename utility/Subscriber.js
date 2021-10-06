const validator = require('../../utils/validator');

class Subscriber {
  constructor (api) {
    this._api = api;
  }

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

    return `${trimAds ? this.trimAds(subscriber.nickname) : subscriber.nickname}${excludeId ? '' : ` (${subscriber.id})`}`;
  }

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

    const summary = subscriber.charmSummary || ((await this._api.charm().getSubscriberSummary(subscriberId)).body || []).map((charm) => charm.charmId);

    subscriber.charmIds = summary;

    if (summary.length === 0) {
      return false;
    }

    return requiresAll ? charmIds.every((id) => summary.includes(id)) : charmIds.some((id) => summary.includes(id));
  }
}

module.exports = Subscriber;
