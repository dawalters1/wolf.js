const fs = require('fs');
const path = require('path');

const Base = require('../Base');

const models = require('../../models');
const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');

class Phrase extends Base {
  constructor (client) {
    super(client);

    this.loadLocal();
  }

  async loadLocal () {
    if (!fs.existsSync(path.resolve(require.main.filename, '../phrases'))) {
      throw new Error('Phrases folder missing in base folder');
    }

    const files = fs.readdirSync(path.resolve(require.main.filename, '../phrases')).filter((file) => file.endsWith('.json'));

    if (files.length === 0) {
      throw new Error('Missing phrase json in phrases folder');
    }

    for (const file of files) {
      const language = path.parse(file).name;

      const phrases = JSON.parse(fs.readFileSync(path.resolve(require.main.filename, `../phrases/${file}`), 'utf8')).map((phrase) =>
        (
          {
            ...phrase,
            language
          }
        )
      );

      this.load(phrases);
    }
  }

  async load (phrases) {
    phrases = Array.isArray(phrases) ? phrases : [phrases];

    if (phrases.length === 0) {
      throw new WOLFAPIError('phrases cannot be an empty array', { phrases });
    }

    for (const phrase of phrases) {
      if (validator.isNullOrWhitespace(phrase.name)) {
        throw new WOLFAPIError('name cannot be null or empty', { phrase });
      }
      if (validator.isNullOrWhitespace(phrase.value)) {
        throw new WOLFAPIError('value cannot be null or empty', { phrase });
      }
      if (validator.isNullOrWhitespace(phrase.language)) {
        throw new WOLFAPIError('language cannot be null or empty', { phrase });
      }

      phrase.name = this.client.utility.string.replace(
        phrase.name,
        {
          keyword: this.client.options.keyword
        }
      );

      const existing = this.cache.find((phr) => this.client.utility.string.isEqual(phrase.name, phr.name));

      if (existing) {
        this.patch(existing, phrase);
      } else {
        this.cache.push(phrase);
      }
    }
  }

  count () {
    const languageCounts = this.cache.reduce((result, value) => {
      result[value.language] = result[value.language] ? result[value.language]++ : 1;

      return result;
    }, {});

    return new models.PhraseCount(this.cache.length, languageCounts);
  }

  getAllByName (name) {
    if (validator.isNullOrWhitespace(name)) {
      throw new WOLFAPIError('name cannot be null or empty', { name });
    }

    return this.cache.filter((phrase) => this.client.utility.string.isEqual(phrase.name, name) || new RegExp(`^${name}_alias([0-9]*)?$`, 'gmiu').test(phrase.name));
  }

  getByLanguageAndName (language, name) {
    if (validator.isNullOrWhitespace(name)) {
      throw new WOLFAPIError('name cannot be null or empty', { name });
    }

    const requested = this.cache.find((phrase) => this.client.utility.string.isEqual(phrase.name, name) && this.client.utility.string.isEqual(phrase.language, language));

    if (requested) {
      return requested.value;
    }

    if (this.client.utility.string.isEqual(language, this.client.options.language.iso)) {
      throw new WOLFAPIError('no phrase located', { name });
    }

    return this.getByLanguageAndName(this.client.options.language.iso, name);
  }

  getByCommandAndName (command, name) {
    if (!(command instanceof models.CommandContext)) {
      throw new WOLFAPIError('command must be type CommandContext', { command });
    } else if (!Reflect.has(command, 'language')) {
      throw new WOLFAPIError('command must contain a language property', { command });
    } else if (validator.isNullOrWhitespace(command.language)) {
      throw new WOLFAPIError('language cannot be null or empty', { command });
    }

    return this.getByCommandAndName(command.language, name);
  }

  isRequestedPhrase (name, input) {
    if (validator.isNullOrWhitespace(name)) {
      throw new WOLFAPIError('name cannot be null or empty', { name });
    }
    if (validator.isNullOrWhitespace(input)) {
      throw new WOLFAPIError('input cannot be null or empty', { input });
    }

    return this.getAllByName(name).find((phrase) => this.client.utility.string.isEqual(phrase.value, input)) !== undefined;
  }
}

module.exports = Phrase;
