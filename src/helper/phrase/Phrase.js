const fs = require('fs');
const path = require('path');

const BaseHelper = require('../BaseHelper');

const validator = require('../../validator');

class Phrase extends BaseHelper {
  constructor (api) {
    super(api);

    this._phrases = {};
    this._defaultLanguage = api.config.get('app.defaultLanguage');

    this._loadLocal();
  }

  async _loadLocal () {
    if (!fs.existsSync(path.resolve(require.main.filename, '../phrases'))) {
      throw new Error(
        'Missing phrase folder - https://github.com/dawalters1/Bot-Template/tree/main/phrases'
      );
    }

    const files = fs
      .readdirSync(path.resolve(require.main.filename, '../phrases'))
      .filter((file) => file.endsWith('.json'));

    if (files.length === 0) {
      throw new Error(
        'Missing phrase jsons - https://github.com/dawalters1/Bot-Template/tree/main/phrases'
      );
    }

    for (const file of files) {
      const language = path.parse(file).name;

      const phrases = JSON.parse(
        fs.readFileSync(
          path.resolve(require.main.filename, `../phrases/${file}`),
          'utf8'
        )
      );

      if (phrases.length === 0) {
        console.warn(`[WARNING] Phrase Helper: ${language} json is empty`);
      }

      if (!this._phrases[language]) {
        this._phrases[language] = {};
      }

      for (const phrase of phrases) {
        if (validator.isNullOrWhitespace(phrase.name)) {
          throw new Error('name cannot be null or empty');
        }
        if (validator.isNullOrWhitespace(phrase.value)) {
          throw new Error('value cannot be null or empty');
        }

        const phraseName = this._api
          .utility()
          .string()
          .replace(phrase.name, {
            keyword: this._api.options.keyword
          })
          .toLowerCase();

        if (!this._phrases[language][phraseName]) {
          this._phrases[language][phraseName] = [];
        }
        this._phrases[language][phraseName].push({
          value: phrase.value,
          default: true
        });
      }
    }
  }

  async load (phrases) {
    try {
      phrases = Array.isArray(phrases) ? phrases : [phrases];

      if (phrases.length === 0) {
        throw new Error('phrases cannot be an empty array');
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

        if (!this._phrases[phrase.language]) {
          this._phrases[phrase.language] = {};
        }

        const phraseName = this._api.utility().string().replace(phrase.name, {
          keyword: this._api.options.keyword
        });

        if (!this._phrases[phrase.language][phraseName.toLowerCase()]) {
          this._phrases[phrase.language][phraseName.toLowerCase()] = [];
        }

        this._phrases[phrase.language][phraseName.toLowerCase()] =
          this._phrases[phrase.language][phraseName.toLowerCase()]
            .filter((phr) => !phr.default)
            .concat(phrase.value);
      }
    } catch (error) {
      error.internalErrorMessage = `api.phrase().load(phrases=${
        JSON.stringify(phrases.slice(0, 15)) + phrases.length > 15 ? '...' : ''
      })`;
      throw error;
    }
  }

  async list () {
    try {
      return Object.entries(this._phrases).reduce((result, value) => {
        const language = value[0];
        const phrases = value[1];

        result.push(
          ...Object.entries(phrases).map((phrase) => ({
            name: phrase[0],
            value: phrase[1],
            language
          }))
        );

        return result;
      });
    } catch (error) {
      error.internalErrorMessage = 'api.phrase().list()';
      throw error;
    }
  }

  async getLanguageList () {
    try {
      return Object.keys(this._phrases);
    } catch (error) {
      error.internalErrorMessage = 'api.phrase().getLanguageList()';
      throw error;
    }
  }

  async count () {
    try {
      const countByLanguage = Object.entries(this._phrases).reduce(
        (result, value) => {
          const language = value[0];
          const phrases = value[1];

          result[language] = Object.keys(phrases).length;

          return result;
        },
        {}
      );

      return {
        countByLanguage,
        total: Object.values(countByLanguage).reduce(
          (result, value) => value + result,
          0
        )
      };
    } catch (error) {
      error.internalErrorMessage = 'api.phrase().count()';
      throw error;
    }
  }

  getAllByName (name) {
    return Object.entries(this._phrases).reduce((result, value) => {
      const phrase = value[1][name.toLowerCase()];

      if (phrase) {
        result.push(
          ...phrase.map((phr) => ({
            name: name.toLowerCase(),
            value: phr.value || phr,
            language: value[0]
          }))
        );
      }
      return result;
    }, []);
  }

  isRequestedPhrase (name, value) {
    try {
      return (
        this.getAllByName(name).find((phrase) =>
          this._api.utility().string().isEqual(phrase.value, value)
        ) !== undefined
      );
    } catch (error) {
      error.internalErrorMessage = `api.phrase().isRequestedPhrase(name=${JSON.stringify(name)}, value=${JSON.stringify(value)})`;
      throw error;
    }
  }

  getByLanguageAndName (language, name) {
    try {
      if (!this._phrases[language]) {
        if (language === this._defaultLanguage) {
          throw new Error('No value found for phrase');
        }

        return this.getByLanguageAndName(this._defaultLanguage, name);
      }

      const phrase = this._phrases[language][name.toLowerCase()];

      if (!phrase) {
        if (language === this._defaultLanguage) {
          throw new Error('No value found for phrase');
        }
        return this.getByLanguageAndName(this._defaultLanguage, name);
      }

      return phrase[0].value || phrase[0];
    } catch (error) {
      error.internalErrorMessage = `api.phrase().getByLanguageAndName(language=${JSON.stringify(language)}, name=${JSON.stringify(name)})`;
      throw error;
    }
  }

  getByCommandAndName (command, name) {
    try {
      if (!validator.isType(command, 'object')) {
        throw new Error('command must be an object');
      } else if (!Reflect.has(command, 'language')) {
        throw new Error('command must contain a language property');
      } else if (validator.isNullOrWhitespace(command.language)) {
        throw new Error('language cannot be null or empty');
      }

      return this.getByLanguageAndName(command.language, name);
    } catch (error) {
      error.internalErrorMessage = `api.phrase().getByCommandAndName(command=${JSON.stringify(command)}, name=${JSON.stringify(name)})`;
      throw error;
    }
  }
}

module.exports = Phrase;
