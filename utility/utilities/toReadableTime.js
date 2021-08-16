const BaseUtility = require('../BaseUtility');
const validator = require('@dawalters1/validator');
const moment = require('moment');

module.exports = class ToReadableTime extends BaseUtility {
  constructor (api) {
    super(api, 'toReadableTime');
  }

  _func (...args) {
    const language = args[0];

    const milliseconds = args[1];
    try {
      if (typeof (language) !== 'string') {
        throw new Error('language must be a string');
      } else if (validator.isNullOrWhitespace(language)) {
        throw new Error('language cannot be null or empty');
      }

      if (!validator.isValidNumber(milliseconds)) {
        throw new Error('milliseconds must be a valid number');
      } else if (validator.isLessThanZero(milliseconds)) {
        throw new Error('milliseconds cannot be less than 0');
      }

      const info = moment.duration(milliseconds, 'milliseconds')._data;

      let str = '';

      if (info.years > 0) {
        str = `${info.years}${this._api.phrase().getByLanguageAndName(language, `${this._api.config.keyword}_time_type_years`)}`;
      }

      if (info.months > 0) {
        str = str + ` ${info.months}${this._api.phrase().getByLanguageAndName(language, `${this._api.config.keyword}_time_type_months`)}`;
      }

      if (info.weeks > 0) {
        str = str + ` ${info.weeks}${this._api.phrase().getByLanguageAndName(language, `${this._api.config.keyword}_time_type_weeks`)}`;
      }

      if (info.days > 0) {
        str = str + ` ${info.days}${this._api.phrase().getByLanguageAndName(language, `${this._api.config.keyword}_time_type_days`)}`;
      }

      if (info.hours > 0) {
        str = str + ` ${info.hours}${this._api.phrase().getByLanguageAndName(language, `${this._api.config.keyword}_time_type_hours`)}`;
      }

      if (info.minutes > 0) {
        str = str + ` ${info.minutes}${this._api.phrase().getByLanguageAndName(language, `${this._api.config.keyword}_time_type_minutes`)}`;
      }

      str = str + ` ${info.seconds}${this._api.phrase().getByLanguageAndName(language, `${this._api.config.keyword}_time_type_seconds`)}`;

      return str.trim();
    } catch (error) {
      error.method = `Utility/utilties/toReadableTime(language = ${JSON.stringify(language)}, milliseconds = ${JSON.stringify(milliseconds)})`;
      throw error;
    }
  }
};
