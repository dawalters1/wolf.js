const validator = require('../../validator');
const Privilege = require('./Privilege');

class Subscriber {
  constructor (api) {
    this._api = api;
    this._privilege = new Privilege(this._api);
  }

  privilege () {
    return this._privilege;
  }

  async getAvatar (subscriberId, size) {
    try {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (!validator.isType(subscriberId, 'number')) {
        throw new Error('subscriberId must be type of number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(size)) {
        throw new Error('size cannot be null or undefined');
      } else if (!validator.isValidNumber(size)) {
        throw new Error('size must be a valid number');
      } else if (validator.isLessThanOrEqualZero(size)) {
        throw new Error('size cannot be less than or equal to 0');
      }

      return await this._api.utility().download().file(this._api.utility().string().replace(`${this._api.endpointConfig.avatarEndpoint}/FileServerSpring/subscriber/avatar/{subscriberId}?size={size}`,
        {
          subscriberId,
          size
        }
      ));
    } catch (error) {
      error.internalErrorMessage = `api.utility().subscriber().getAvatar(subscriberId=${JSON.stringify(subscriberId)}, size=${JSON.stringify(size)})`;
      throw error;
    }
  }

  toDisplayName (subscriber, trimAds = true, excludeId = false) {
    try {
      if (typeof subscriber !== 'object') {
        throw new Error('subscriber must be object');
      }

      if (!Reflect.has(subscriber, 'nickname')) {
        throw new Error('subscriber must contain nickname');
      } else if (validator.isNullOrUndefined(subscriber.nickname)) {
        throw new Error('subscriber cannot be null or undefined');
      }

      if (!Reflect.has(subscriber, 'id')) {
        throw new Error('subscriber must contain id');
      } else if (validator.isNullOrUndefined(subscriber.id)) {
        throw new Error('id cannot be null or undefined');
      } else if (!validator.isValidNumber(subscriber.id)) {
        throw new Error('id must be a valid number');
      } else if (!validator.isType(subscriber.id, 'number')) {
        throw new Error('id must be type of number');
      } else if (validator.isLessThanOrEqualZero(subscriber.id)) {
        throw new Error('id cannot be less than or equal to 0');
      }

      if (!validator.isValidBoolean(trimAds)) {
        throw new Error('trimAds must be a valid boolean');
      }

      if (!validator.isValidBoolean(excludeId)) {
        throw new Error('excludeId must be a valid boolean');
      }

      return `${trimAds ? this._api.utility().string().trimAds(subscriber.nickname) : subscriber.nickname}${excludeId ? '' : ` (${subscriber.id})`}`;
    } catch (error) {
      Reflect.deleteProperty(subscriber, '_api');
      error.internalErrorMessage = `api.utility().subscriber().toDisplayName(subscriber=${JSON.stringify(subscriber)}, trimAds=${JSON.stringify(trimAds)}, excludeId=${JSON.stringify(excludeId)})`;
      throw error;
    }
  }

  async hasCharm (subscriberId, charmIds, requireAll = false) {
    try {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (!validator.isType(subscriberId, 'number')) {
        throw new Error('subscriberId must be type of number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      charmIds = Array.isArray(charmIds) ? charmIds : [charmIds];

      for (const charmId of charmIds) {
        if (validator.isNullOrUndefined(charmId)) {
          throw new Error('charmId cannot be null or undefined');
        } else if (!validator.isValidNumber(charmId)) {
          throw new Error('charmId must be a valid number');
        } else if (!validator.isType(charmId, 'number')) {
          throw new Error('charmId must be type of number');
        } else if (validator.isLessThanOrEqualZero(charmId)) {
          throw new Error('charmId cannot be less than or equal to 0');
        }
      }

      if (!validator.isValidBoolean(requireAll)) {
        throw new Error('requireAll must be a valid boolean');
      }
      const subscriber = await this._api.subscriber().getById(subscriberId);

      if (!subscriber.exists) {
        return false;
      }

      // Check to see if the charm is selected before requesting the summary
      if ((!requireAll || charmIds.length === 1) && subscriber.charms && subscriber.charms.selectedList && subscriber.charms.selectedList.some((selected) => charmIds.includes(selected.charmId))) {
        return true;
      }

      const summary = subscriber.charmIds || ((await this._api.charm().getSubscriberSummary(subscriberId)).body || []).map((charm) => charm.charmId);

      subscriber.charmIds = summary;

      if (summary.length === 0) {
        return false;
      }

      return requireAll ? charmIds.every((id) => summary.includes(id)) : charmIds.some((id) => summary.includes(id));
    } catch (error) {
      error.internalErrorMessage = `api.utility().subscriber().hasCharm(subscriberId=${JSON.stringify(subscriberId)}, charmIds=${JSON.stringify(charmIds)}, requireAll=${JSON.stringify(requireAll)})`;
      throw error;
    }
  }
}

module.exports = Subscriber;
