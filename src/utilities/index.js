import ChannelUtility from './channel.js';
import imageSize from 'image-size';
import Language from '../constants/Language.js';
import moment from 'moment';
import NumberUtility from './number.js';
import StringUtility from './string.js';
import TimerUtility from './timer.js';
import UserUtility from './user.js';

class Utility {
  constructor (client) {
    this.client = client;

    this.channel = new ChannelUtility(client);
    this.string = new StringUtility(client);
    this.number = new NumberUtility();
    this.timer = new TimerUtility(client);
    this.user = new UserUtility(client);
  }

  /** @internal */
  async _validateBuffer (config, buffer, mimeType) {
    const mimeTypeConfig = config.validation.mimeTypes.find((supportedMimeType) => supportedMimeType.mimeType === mimeType);

    if (!mimeTypeConfig) { throw new Error(`MimeType type '${mimeType}' is unsupported`); }

    if (mimeType.startsWith('image/') && config.validation.square) {
      const { width, height } = imageSize(buffer);

      if (width !== height) { throw new Error('Image must be square'); }
    }

    if (Buffer.byteLength(buffer) > mimeTypeConfig.size) { throw new Error(`Buffer must be no larger than '${mimeTypeConfig.size}' it is ${Buffer.byteLength(buffer)} `); }

    return true;
  }

  async delay (time, type = 'milliseconds') {
    return new Promise((resolve) =>
      setTimeout(resolve, type === 'seconds'
        ? time * 1000
        : time)
    );
  }

  toReadableTime (time, language, type = 'milliseconds') {
    const info = moment.duration(time, type)._data;
    const parts = [];

    const timeUnits = [
      ['years', `${this.client.config.keyword}_time_type_years`],
      ['months', `${this.client.config.keyword}_time_type_months`],
      ['weeks', `${this.client.config.keyword}_time_type_weeks`],
      ['days', `${this.client.config.keyword}_time_type_days`],
      ['hours', `${this.client.config.keyword}_time_type_hours`],
      ['minutes', `${this.client.config.keyword}_time_type_minutes`]
    ];

    for (const [unit, phraseKey] of timeUnits) {
      if (info[unit] > 0) {
        parts.push(`${info[unit]}${this.client.phrase.getByLanguageAndName(language, phraseKey)}`);
      }
    }

    if ((!info.seconds && parts.length === 0) || info.seconds > 0) {
      parts.push(`${info.seconds}${this.client.phrase.getByLanguageAndName(language, `${this.client.config.keyword}_time_type_seconds`)}`);
    }

    return parts.join(' ');
  }

  toLanguageId (languageKey) {
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

  toLanguageKey (languageId) {
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
}

export default Utility;
