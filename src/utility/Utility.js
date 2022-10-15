import validator from '../validator/index.js';
import WOLFAPIError from '../models/WOLFAPIError.js';
import { Language } from '../constants/index.js';
import moment from 'moment';
import ArrayUtility from './Array/index.js';
import Download from './Download/index.js';
import Group from './Group/Group.js';
import NumberUtility from './Number/index.js';
import StringUtility from './String/index.js';
import Subscriber from './Subscriber/Subscriber.js';
import Timer from './Timer/index.js';

class Utility {
  constructor (client) {
    this.client = client;
    this.download = Download;
    this.array = new ArrayUtility();
    this.group = new Group(client);
    this.number = new NumberUtility();
    this.string = new StringUtility(client);
    this.subscriber = new Subscriber(client);
    this.timer = new Timer(client);
  }

  toLanguageKey (languageId) {
    if (validator.isNullOrUndefined(languageId)) {
      throw new WOLFAPIError('languageId cannot be null or undefined', { languageId });
    } else if (!validator.isValidNumber(languageId)) {
      throw new WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(languageId)) {
      throw new Error('languageId is invalid');
    }

    switch (languageId) {
      case Language.ARABIC:
        return 'ar';

      case Language.BAHASA_INDONESIA:
        return 'in';

      case Language.BRAZILIAN_PORTUGUESE:
        return 'br';

      case Language.BULGARIAN:
        return 'bu';

      case Language.CHINESE_SIMPLIFIED:
        return 'ch';

      case Language.CZECH:
        return 'cz';

      case Language.DANISH:
        return 'da';

      case Language.DUTCH:
        return 'du';

      case Language.ENGLISH:
        return 'en';

      case Language.ESTONIAN:
        return 'et';

      case Language.FINNISH:
        return 'fi';

      case Language.FRENCH:
        return 'fr';

      case Language.GERMAN:
        return 'ge';

      case Language.GREEK:
        return 'gr';

      case Language.HINDI:
        return 'hi';

      case Language.HUNGARIAN:
        return 'hu';

      case Language.ITALIAN:
        return 'it';

      case Language.JAPANESE:
        return 'ja';

      case Language.KAZAKH:
        return 'ka';

      case Language.KOREAN:
        return 'ko';

      case Language.LATIN_SPANISH:
        return 'ls';

      case Language.LATVIAN:
        return 'la';

      case Language.LITHUANIAN:
        return 'li';

      case Language.MALAY:
        return 'ma';

      case Language.NORWEGIAN:
        return 'no';

      case Language.PERSIAN_FARSI:
        return 'fa';

      case Language.POLISH:
        return 'po';

      case Language.PORTUGUESE:
        return 'pt';

      case Language.RUSSIAN:
        return 'ru';

      case Language.SLOVAK:
        return 'sl';

      case Language.SPANISH:
        return 'es';

      case Language.SWEDISH:
        return 'sv';

      case Language.THAI:
        return 'th';

      case Language.TURKISH:
        return 'tr';

      case Language.UKRAINIAN:
        return 'uk';

      case Language.VIETNAMESE:
        return 'vi';

      default:
        return 'en';
    }
  }

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

    if (info.seconds > 0) {
      parts.push(`${info.seconds}${this.client.phrase.getByLanguageAndName(language, `${this.client.config.keyword}_time_type_seconds`)}`);
    }

    return parts.join(' ');
  }
}

export default Utility;
