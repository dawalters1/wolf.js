import validator from '../validator/index.js';
import WOLFAPIError from '../models/WOLFAPIError.js';
import { Language } from '../constants/index.js';
import moment from 'moment';
import ArrayUtility from './Array/index.js';
import Channel from './Channel/Channel.js';
import NumberUtility from './Number/index.js';
import StringUtility from './String/index.js';
import Subscriber from './Subscriber/Subscriber.js';
import Timer from './Timer/index.js';
import superagent from 'superagent';
import Join from './Join/index.js';
import Leave from './Leave/index.js';

class Utility {
  constructor (client) {
    this.client = client;
    this.array = new ArrayUtility();
    this.channel = new Channel(client);
    this.group = this.channel;
    this.number = new NumberUtility();
    this.string = new StringUtility(client);
    this.subscriber = new Subscriber(client);
    this.timer = new Timer(client);
  }

  /**
   * Join a channel
   * @param {CommandContext} command
   * @param {Function | undefined} onPermissionErrorCallback
   * @returns {Promise<MessageResponse>}
   */
  async join (command, onPermissionErrorCallback) {
    return await Join(this.client, command, onPermissionErrorCallback);
  }

  /**
   * Leave a channel
   * @param {CommandContext} command
   * @param {Function | undefined} onPermissionErrorCallback
   * @returns {Promise<MessageResponse>}
   */
  async leave (command, onPermissionErrorCallback) {
    return await Leave(this.client, command, onPermissionErrorCallback);
  }

  /**
   * Download data from a url
   * @param {String} url
   * @returns {Promise<Buffer>}
   */
  async download (url) {
    return await superagent
      .get(url)
      .buffer(true)
      .parse(superagent.parse.image)
      .then(res => res.body);
  }

  /**
   * Convert string language to LanguageID
   * @param {String} languageKey
   * @returns {Number}
   */
  toLanguageId (languageKey) {
    if (validator.isNullOrUndefined(languageKey)) {
      throw new WOLFAPIError('languageKey cannot be null or undefined', { languageKey });
    }

    const languageKeyMap = {
      ar: Language.ARABIC,
      in: Language.BAHASA_INDONESIA,
      br: Language.BRAZILIAN_PORTUGUESE,
      bu: Language.BULGARIAN,
      ch: Language.CHINESE_SIMPLIFIED,
      cz: Language.CZECH,
      da: Language.DANISH,
      du: Language.DUTCH,
      en: Language.ENGLISH,
      et: Language.ESTONIAN,
      fi: Language.FINNISH,
      fr: Language.FRENCH,
      ge: Language.GERMAN,
      gr: Language.GREEK,
      hi: Language.HINDI,
      hu: Language.HUNGARIAN,
      it: Language.ITALIAN,
      ja: Language.JAPANESE,
      ka: Language.KAZAKH,
      ko: Language.KOREAN,
      ls: Language.LATIN_SPANISH,
      la: Language.LATVIAN,
      li: Language.LITHUANIAN,
      ma: Language.MALAY,
      no: Language.NORWEGIAN,
      fa: Language.PERSIAN_FARSI,
      po: Language.POLISH,
      pt: Language.PORTUGUESE,
      ru: Language.RUSSIAN,
      sl: Language.SLOVAK,
      es: Language.SPANISH,
      sv: Language.SWEDISH,
      th: Language.THAI,
      tr: Language.TURKISH,
      uk: Language.UKRAINIAN,
      vi: Language.VIETNAMESE
    };

    return languageKeyMap[languageKey.toLocaleLowerCase()] ?? Language.ENGLISH;
  }

  /**
   * Convert LanguageID to string language
   * @param {Number} languageId
   * @returns {String}
   */
  toLanguageKey (languageId) {
    if (validator.isNullOrUndefined(languageId)) {
      throw new WOLFAPIError('languageId cannot be null or undefined', { languageId });
    } else if (!validator.isValidNumber(languageId)) {
      throw new WOLFAPIError('languageId must be a valid number', { languageId });
    }

    const languageIdMap = {
      14: 'ar',
      28: 'in',
      37: 'br',
      45: 'bu',
      11: 'ch',
      22: 'cz',
      24: 'da',
      30: 'du',
      1: 'en',
      39: 'et',
      25: 'fi',
      6: 'fr',
      3: 'ge',
      16: 'gr',
      18: 'hi',
      27: 'hu',
      13: 'it',
      19: 'ja',
      41: 'ka',
      36: 'ko',
      20: 'ls',
      42: 'la',
      43: 'li',
      29: 'ma',
      31: 'no',
      15: 'fa',
      10: 'po',
      17: 'pt',
      12: 'ru',
      21: 'sl',
      4: 'es',
      32: 'sv',
      33: 'th',
      34: 'tr',
      44: 'uk',
      35: 'vi'
    };

    return languageIdMap[languageId] ?? 'en';
  }

  /**
   * Delay a method
   * @param {Number} time
   * @param {'milliseconds' | 'seconds'} type
   * @returns {Promise<void>}
   */
  delay (time, type = 'milliseconds') {
    if (validator.isNullOrUndefined(time)) {
      throw new WOLFAPIError('time cannot be null or undefined', { time });
    } else if (!validator.isValidNumber(time)) {
      throw new WOLFAPIError('time must be a valid number', { time });
    } else if (validator.isLessThanZero(time)) {
      throw new WOLFAPIError('time cannot be less than 0', { time });
    }

    if (validator.isNullOrUndefined(type)) {
      throw new WOLFAPIError('type cannot be null or undefined', { type });
    } else if (!['milliseconds', 'seconds'].includes(type)) {
      throw new WOLFAPIError('type is unsupported', { type });
    }

    return new Promise((resolve) =>
      setTimeout(resolve, type === 'seconds' ? time * 1000 : time)
    );
  }

  /**
   * Convert a number to a readable time format
   * @param {String} language
   * @param {Number} time
   * @param {'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'} type
   * @returns {string}
   */
  toReadableTime (language, time, type = 'milliseconds') {
    if (typeof language !== 'string') {
      throw new WOLFAPIError('language must be a string', { language });
    } else if (validator.isNullOrWhitespace(language)) {
      throw new WOLFAPIError('language cannot be null or empty', { language });
    }

    if (validator.isNullOrUndefined(time)) {
      throw new WOLFAPIError('time cannot be null or undefined', { time });
    } else if (!validator.isValidNumber(time)) {
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
      parts.push(`${info.years}${this.client.phrase.getByLanguageAndName(language, `${this.client.config.keyword}_time_type_years`)}`);
    }

    if (info.months > 0) {
      parts.push(`${info.months}${this.client.phrase.getByLanguageAndName(language, `${this.client.config.keyword}_time_type_months`)}`);
    }

    if (info.weeks > 0) {
      parts.push(`${info.weeks}${this.client.phrase.getByLanguageAndName(language, `${this.client.config.keyword}_time_type_weeks`)}`);
    }

    if (info.days > 0) {
      parts.push(`${info.days}${this.client.phrase.getByLanguageAndName(language, `${this.client.config.keyword}_time_type_days`)}`);
    }

    if (info.hours > 0) {
      parts.push(`${info.hours}${this.client.phrase.getByLanguageAndName(language, `${this.client.config.keyword}_time_type_hours`)}`);
    }

    if (info.minutes > 0) {
      parts.push(`${info.minutes}${this.client.phrase.getByLanguageAndName(language, `${this.client.config.keyword}_time_type_minutes`)}`);
    }

    if ((!info.seconds && !parts.length) || info.seconds > 0) {
      parts.push(`${info.seconds}${this.client.phrase.getByLanguageAndName(language, `${this.client.config.keyword}_time_type_seconds`)}`);
    }

    return parts.join(' ');
  }
}

export default Utility;
