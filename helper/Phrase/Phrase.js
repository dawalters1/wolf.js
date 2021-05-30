const Helper = require('../Helper');

const path = require('path');
const fs = require('fs');

const validator = require('@dawalters1/validator');

module.exports = class Phrase extends Helper {
  constructor (bot) {
    super(bot);

    this._cache = [];
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
            if (validator.isNullOrWhitespace(item.language)) {
              throw new Error('language cannot be null or empty');
            }
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

  list () {
    return this._cache.concat(this._local).filter(Boolean);
  }

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

  clear () {
    this._local = [];
    this._cache = [];
  }

  load (phrases) {
    if (!validator.isValidArray(phrases)) {
      throw new Error('phrases must be an array');
    } else if (phrases.length === 0) {
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

    this._cache = phrases;
  }

  getLangaugeList () {
    return [...new Set(this.list().map((phrase) => phrase.language))];
  }

  getAllByName (name) {
    if (validator.isNullOrWhitespace(name)) {
      throw new Error('name cannot be null or empty');
    }
    return this.list().filter((phrase) => phrase.name.toLowerCase().trim() === name.toLowerCase().trim());
  }

  getByLanguageAndName (language, name) {
    if (validator.isNullOrWhitespace(language)) {
      throw new Error('language cannot be null or empty');
    }

    if (validator.isNullOrWhitespace(name)) {
      throw new Error('name cannot be null or empty');
    }

    const phrase = this.list().find((phrase) => phrase.name.toLowerCase().trim() === name.toLowerCase().trim() && phrase.language.toLowerCase().trim() === language.toLowerCase().trim());

    if (phrase) {
      return phrase.value;
    }

    if (language === this._config.app.defaultLanguage) {
      return `missing_${language}_phrase_for_${name}`;
    }

    return this.getByLanguageAndName(this._config.app.defaultLanguage, name);
  }

  getByCommandAndName (command, name) {
    if (typeof (command) !== 'object') {
      throw new Error('command must be an object');
    } else if (command.language === undefined) {
      throw new Error('command must contain a language property');
    } else if (validator.isNullOrWhitespace(command.language)) {
      throw new Error('language cannot be null or empty');
    }

    return this.getByLanguageAndName(command, name);
  }

  isRequestedPhrase (name, value) {
    return this.list().find((phrase) => phrase.name.toLowerCase().trim() === name.toLowerCase().trim() && phrase.value.toLowerCase().trim() === value.toLowerCase().trim()) !== null;
  }
};
