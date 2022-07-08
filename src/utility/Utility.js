const validator = require('../validator');
const WOLFAPIError = require('../models/WOLFAPIError');
const { Language } = require('../constants');

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
    this.group = new Group(client);
    this.number = new NumberUtility();
    this.string = new StringUtility();
    this.timer = new Timer(client);
  }

  toLanguageKey (languageId) {
    if (validator.isNullOrUndefined(length)) {
      throw new WOLFAPIError('languageId cannot be null or undefined', { languageId });
    } else if (!validator.languageId(length)) {
      throw new WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(languageId)) {
      throw new Error('languageId is invalid');
    }

    switch (languageId) {
      case Language.ARABIC : return 'ar';
      case Language.BAHASA_INDONESIA : return 'in';
      case Language.BRAZILIAN_PORTUGUESE : return 'br';
      case Language.BULGARIAN : return 'bu';
      case Language.CHINESE_SIMPLIFIED : return 'ch';
      case Language.CZECH : return 'cz';
      case Language.DANISH : return 'da';
      case Language.DUTCH : return 'du';
      case Language.ENGLISH : return 'en';
      case Language.ESTONIAN : return 'et';
      case Language.FINNISH : return 'fi';
      case Language.FRENCH : return 'fr';
      case Language.GERMAN : return 'ge';
      case Language.GREEK : return 'gr';
      case Language.HINDI : return 'hi';
      case Language.HUNGARIAN : return 'hu';
      case Language.ITALIAN : return 'it';
      case Language.JAPANESE : return 'ja';
      case Language.KAZAKH : return 'ka';
      case Language.KOREAN : return 'ko';
      case Language.LATIN_SPANISH : return 'ls';
      case Language.LATVIAN : return 'la';
      case Language.LITHUANIAN : return 'li';
      case Language.MALAY : return 'ma';
      case Language.NORWEGIAN : return 'no';
      case Language.PERSIAN_FARSI : return 'fa';
      case Language.POLISH : return 'po';
      case Language.PORTUGUESE : return 'pt';
      case Language.RUSSIAN : return 'ru';
      case Language.SLOVAK : return 'sl';
      case Language.SPANISH : return 'es';
      case Language.SWEDISH : return 'sv';
      case Language.THAI : return 'th';
      case Language.TURKISH : return 'tr';
      case Language.UKRAINIAN : return 'uk';
      case Language.VIETNAMESE : return 'vi';
      default: return 'en';
    }
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

    const parts = [];

    if (info.years > 0) {
      parts.push(`${info.years}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_years`)}`);
    }

    if (info.months > 0) {
      parts.push(`${info.months}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_months`)}`);
    }

    if (info.weeks > 0) {
      parts.push(`${info.weeks}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_weeks`)}`);
    }

    if (info.days > 0) {
      parts.push(`${info.days}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_days`)}`);
    }

    if (info.hours > 0) {
      parts.push(`${info.hours}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_hours`)}`);
    }

    if (info.minutes > 0) {
      parts.push(`${info.minutes}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_minutes`)}`);
    }

    if (info.seconds > 0) {
      parts.push(`${info.seconds}${this.client.phrase.getByLanguageAndName(language, `${this.client.options.keyword}_time_type_seconds`)}`);
    }

    return parts.join(' ');
  }
}

module.exports = Utility;
