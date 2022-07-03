const validator = require('../validator');
const WOLFAPIError = require('../models/WOLFAPIError');

const moment = require('moment');

const ArrayUtility = require('./Array');
const Download = require('./Download');
const Group = require('./Group/Group');
const NumberUtility = require('./Number');
const StringUtility = require('./String');
const Timer = require('./Timer');

class Utility {
  constructor (client) {
    this.client = client;

    this.array = new ArrayUtility();
    this.download = new Download();
    this.group = new Group();
    this.number = new NumberUtility();
    this.string = new StringUtility();
    this.timer = new Timer(client);
  }

  delay (time, type = 'milliseconds') {
    if (validator.isNullOrUndefined(length)) {
      throw new WOLFAPIError('time cannot be null or undefined', { time });
    } else if (!validator.isValidNumber(length)) {
      throw new WOLFAPIError('time must be a valid number', { time });
    } else if (validator.isLessThanZero(time)) {
      throw new WOLFAPIError('time cannot be less than 0', { time });
    }

    if (validator.isNullOrUndefined(type)) {
      throw new WOLFAPIError('type cannot be null or undefined', { type });
    } else if (!['milliseconds', 'seconds'].includes(type)) {
      throw new WOLFAPIError('type is unsupported', { type });
    }

    return new Promise(resolve => setTimeout(resolve, type === 'seconds' ? time * 1000 : time));
  }

  toReadableTime (language, time, type = 'milliseconds') {
    if (typeof (language) !== 'string') {
      throw new WOLFAPIError('language must be a string', { language });
    } else if (validator.isNullOrWhitespace(language)) {
      throw new WOLFAPIError('language cannot be null or empty', { language });
    }

    if (validator.isNullOrUndefined(length)) {
      throw new WOLFAPIError('time cannot be null or undefined', { time });
    } else if (!validator.isValidNumber(length)) {
      throw new WOLFAPIError('time must be a valid number', { time });
    } else if (validator.isLessThanZero(time)) {
      throw new WOLFAPIError('time cannot be less than 0', { time });
    }

    if (validator.isNullOrUndefined(type)) {
      throw new WOLFAPIError('type cannot be null or undefined', { type });
    } else if (!['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'].includes(type)) {
      throw new WOLFAPIError('type is unsupported', { type });
    }

    const info = moment.duration(time, type)._data;

    const part = [];

    if (info.years > 0) {
      part.push(`${info.years}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_years`)}`);
    }

    if (info.months > 0) {
      part.push(`${info.months}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_months`)}`);
    }

    if (info.weeks > 0) {
      part.push(`${info.weeks}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_weeks`)}`);
    }

    if (info.days > 0) {
      part.push(`${info.days}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_days`)}`);
    }

    if (info.hours > 0) {
      part.push(`${info.hours}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_hours`)}`);
    }

    if (info.minutes > 0) {
      part.push(`${info.minutes}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_minutes`)}`);
    }

    if (info.seconds > 0) {
      part.push(`${info.seconds}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_seconds`)}`);
    }

    return part.join(' ');
  }
}

module.exports = Utility;
