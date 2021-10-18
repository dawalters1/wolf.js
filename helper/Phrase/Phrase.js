const Helper = require('../Helper');
const validator = require('../../validator');

const path = require('path');
const fs = require('fs');

/**
 * {@hideconstructor}
 */
module.exports = class Phrase extends Helper {
  constructor (api) {
    super(api);

    this._phrases = [];
    this._local = [];

    const phrasePath = path.join(path.dirname(require.main.filename), '/phrases/');

    if (fs.existsSync(phrasePath)) {
      const files = fs.readdirSync('./phrases').filter(file => file.endsWith('.json'));
      if (files.length > 0) {
        for (const phrase of files) {
          for (const item of JSON.parse(fs.readFileSync(`${phrasePath}/${phrase}`, 'utf-8'))) {
            if (validator.isNullOrWhitespace(item.name)) {
              throw new Error('name cannot be null or empty');
            }
            if (validator.isNullOrWhitespace(item.value)) {
              throw new Error('value cannot be null or empty');
            }

            item.language = path.parse(phrase).name;

            this._local.push(item);
          }
        }
      } else {
        throw new Error('This api relies on phrases to be present\nSee https://github.com/dawalters1/Bot-Template/blob/main/phrases/en.json');
      }
    } else {
      throw new Error('Folder phrases missing\nSee https://github.com/dawalters1/Bot-Template/tree/main/phrases');
    }
  }

  /**
   *
   * List of all phrases loaded into the bot
   */
  list (includeLocal = true) {
    if (!includeLocal) {
      return this._phrases;
    }
    return this._phrases.concat(this._local).filter(Boolean);
  }

  /**
   *
   * Get overall phrase count, and phrase count by language
   */
  count () {
    const result = [...new Set(this.list().map((phrase) => phrase.language.toLowerCase()))].reduce((result, value) => {
      result[value] = this.list().filter((phrase) => phrase.language.toLowerCase() === value.toLowerCase().trim()).length;

      return result;
    }, {});

    return {
      countByLanguage: result,
      total: this.list().length
    };
  }

  /**
   * Clear all phrases
   */
  clear () {
    this._local = [];
    this._phrases = [];
  }

  /**
   * Load phrases into the cache
   * @param {[{name: string, value: string, language: string}]} phrases - List of phrases
   */
  load (phrases) {
    phrases = Array.isArray(phrases) ? phrases : [phrases];

    if (phrases.length === 0) {
      throw new Error('phrases must not be empty');
    }

    for (const phrase of phrases) {
      if (validator.isNullOrWhitespace(phrase.name)) {
        throw new Error('name cannot be null or empty');
      }
      if (validator.isNullOrWhitespace(phrase.value)) {
        throw new Error('value cannot be null or empty');
      }
      if (validator.isNullOrWhitespace(phrase.language)) {
        throw new Error('language cannot be null or empty');
      }
    }

    this._phrases = phrases;
  }

  /**
   *
   * List of all languages in the cache
   */
  getLanguageList () {
    return [...new Set(this.list().map((phrase) => phrase.language))];
  }

  _getAllByName (name, includeLocal = false) {
    const phrases = this.list(includeLocal).filter((phrase) => phrase.name.toLowerCase().trim() === name.toLowerCase().trim());

    if (phrases.length === 0 && !includeLocal) {
      return this._getAllByName(name, true);
    }

    return phrases;
  }

  /**
   * List of all phrases by name
   * @param {String} name - The name of the phrase
   */
  getAllByName (name) {
    if (validator.isNullOrWhitespace(name)) {
      throw new Error('name cannot be null or empty');
    }
    return this._getAllByName(name);
  }

  _getByNameAndLanguage (name, language, includeLocal = false) {
    const phrase = this.list(includeLocal).find((phrase) => phrase.name.toLowerCase().trim() === name.toLowerCase().trim() && phrase.language.toLowerCase().trim() === language.toLowerCase().trim());

    if (!phrase && !includeLocal) {
      return this._getByNameAndLanguage(name, language, true);
    }

    return phrase;
  }

  /**
   * Get a phrase by language and name
   * @param {string} language - The phrase languages
   * @param {string} name - The phrase name
   */
  getByLanguageAndName (language, name) {
    if (validator.isNullOrWhitespace(language)) {
      throw new Error('language cannot be null or empty');
    }

    if (validator.isNullOrWhitespace(name)) {
      throw new Error('name cannot be null or empty');
    }

    const phrase = this._getByNameAndLanguage(name, language);

    if (phrase) {
      return phrase.value;
    }

    if (language === this._api.config.app.defaultLanguage) {
      return `missing_${language}_phrase_for_${name}`;
    }

    return this.getByLanguageAndName(this._api.config.app.defaultLanguage, name);
  }

  /**
   * Get a phrase by name using command language
   * @param {Object} command - The command
   * @param {String} name - The phrase name
   */
  getByCommandAndName (command, name) {
    if (typeof (command) !== 'object') {
      throw new Error('command must be an object');
    } else if (command.language === undefined) {
      throw new Error('command must contain a language property');
    } else if (validator.isNullOrWhitespace(command.language)) {
      throw new Error('language cannot be null or empty');
    }

    return this.getByLanguageAndName(command.language, name);
  }

  /**
   * Check to see if what the user sent matches a specific phrase
   * @param {*} name - The phrase name
   * @param {*} value - The user input
   */
  isRequestedPhrase (name, value) {
    return this.list().find((phrase) => this._api.utility().string().isEqual(phrase.name, name) && this._api.utility().string().isEqual(phrase.value, value));
  }

  _clearCache () {
    this._local = [];
    this._phrases = [];
  }
};
