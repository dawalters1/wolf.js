const validator = require('../validator');

const moment = require('moment');

const AchievementUtility = require('./Achievement');
const ArrayUtility = require('./Array');
const DiscoveryUtility = require('./Discovery');
const DownloadUtility = require('./Download');
const GroupUtility = require('./Group/Group');
const NumberUtility = require('./Number');
const StringUtility = require('./String');
const SubscriberUtility = require('./Subscriber/Subscriber');
const TimerUtility = require('./Timer');

const _toLanguageKey = require('./ToLanguageKey');

const { Language } = require('../constants');

class Utility {
  constructor (api) {
    this._api = api;

    this._achievement = new AchievementUtility(this._api);
    this._array = new ArrayUtility(this._api);
    this._discovery = new DiscoveryUtility(this._api);
    this._download = new DownloadUtility(this._api);
    this._group = new GroupUtility(this._api);
    this._number = new NumberUtility(this._api);
    this._string = new StringUtility(this._api);
    this._subscriber = new SubscriberUtility(this._api);
    this._timer = new TimerUtility(this._api);
  }

  achievement () {
    return this._achievement;
  }

  array () {
    return this._array;
  }

  discovery () {
    return this._discovery;
  }

  download () {
    return this._download;
  }

  group () {
    return this._group;
  }

  number () {
    return this._number;
  }

  string () {
    return this._string;
  }

  subscriber () {
    return this._subscriber;
  }

  timer () {
    return this._timer;
  }

  getUTCTimestamp () {
    return new Date(new Date().toUTCString()).getTime();
  }

  toLanguageKey (language) {
    try {
      if (validator.isNullOrUndefined(language)) {
        throw new Error('language cannot be null or undefined');
      } else if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (validator.isLessThanOrEqualZero(language)) {
        throw new Error('language cannot be less than or equal to 0');
      } else if (!Object.values(Language).includes(language)) {
        throw new Error('language is invalid');
      }

      return _toLanguageKey(language);
    } catch (error) {
      error.internalErrorMessage = `api.utility().toLanguageKey(language=${JSON.stringify(language)})`;
      throw error;
    }
  }

  toReadableTime (language, milliseconds) {
    try {
      if (typeof (language) !== 'string') {
        throw new Error('language must be a string');
      } else if (validator.isNullOrWhitespace(language)) {
        throw new Error('language cannot be null or empty');
      }

      if (validator.isNullOrUndefined(milliseconds)) {
        throw new Error('milliseconds cannot be null or undefined');
      } else if (!validator.isValidNumber(milliseconds)) {
        throw new Error('milliseconds must be a valid number');
      } else if (validator.isLessThanZero(milliseconds)) {
        throw new Error('milliseconds cannot be less than 0');
      }

      if (milliseconds === 0) {
        return `0${this._api._phrase.getByLanguageAndName(language, `${this._api.options.keyword}_time_type_seconds`)}`;
      }

      if (milliseconds < 1000) {
        return `${(milliseconds / 1000).toFixed(2)}${this._api._phrase.getByLanguageAndName(language, `${this._api.options.keyword}_time_type_seconds`)}`;
      }

      const info = moment.duration(milliseconds, 'milliseconds')._data;

      const time = [];

      if (info.years > 0) {
        time.push(`${info.years}${this._api._phrase.getByLanguageAndName(language, `${this._api.options.keyword}_time_type_years`)}`);
      }

      if (info.months > 0) {
        time.push(`${info.months}${this._api._phrase.getByLanguageAndName(language, `${this._api.options.keyword}_time_type_months`)}`);
      }

      if (info.weeks > 0) {
        time.push(`${info.weeks}${this._api._phrase.getByLanguageAndName(language, `${this._api.options.keyword}_time_type_weeks`)}`);
      }

      if (info.days > 0) {
        time.push(`${info.days}${this._api._phrase.getByLanguageAndName(language, `${this._api.options.keyword}_time_type_days`)}`);
      }

      if (info.hours > 0) {
        time.push(`${info.hours}${this._api._phrase.getByLanguageAndName(language, `${this._api.options.keyword}_time_type_hours`)}`);
      }

      if (info.minutes > 0) {
        time.push(`${info.minutes}${this._api._phrase.getByLanguageAndName(language, `${this._api.options.keyword}_time_type_minutes`)}`);
      }

      if (info.seconds > 0) {
        time.push(`${info.seconds}${this._api._phrase.getByLanguageAndName(language, `${this._api.options.keyword}_time_type_seconds`)}`);
      }

      return time.join(' ');
    } catch (error) {
      error.internalErrorMessage = `api.utility().toDisplayTime(language=${JSON.stringify(language)}, milliseconds=${JSON.stringify(milliseconds)})`;
      throw error;
    }
  }

  async delay (duration) {
    try {
      if (validator.isNullOrUndefined(duration)) {
        throw new Error('duration cannot be null or undefined');
      } else if (!validator.isValidNumber(duration)) {
        throw new Error('duration must be a valid number');
      } else if (validator.isLessThanOrEqualZero(duration)) {
        throw new Error('duration cannot be less than or equal to 0');
      }

      return new Promise(resolve => {
        setTimeout(resolve, duration);
      });
    } catch (error) {
      error.internalErrorMessage = `api.utility().delay(duration=${JSON.stringify(duration)})`;
      throw error;
    }
  }
}

module.exports = Utility;
