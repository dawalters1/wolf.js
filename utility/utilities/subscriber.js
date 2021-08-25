const BaseUtility = require('../BaseUtility');
const validator = require('@dawalters1/validator');

module.exports = class Subscriber extends BaseUtility {
  constructor (api) {
    super(api, 'subscriber');
  }

  _func () {
    return {
      toDisplayName: (...args) => this.toDisplayName(...args),
      trimAds: (...args) => this.trimAds(...args)
    };
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

  trimAds (name) {
    if (!name) {
      return name;
    }

    const matches = [...name.matchAll(/\[([^\][]*)]/g)];

    if (matches.length === 0) {
      return name;
    }

    for (const match of matches.reverse()) {
      name = name.substring(0, match.index) + match[1] + name.substring(match.index + match[0].length);
    }

    // Loop check to prevent [[[]]]
    return this.trimAds(name);
  }
};
