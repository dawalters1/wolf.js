import fs from 'fs';
import path, { dirname } from 'path';
import Base from '../Base.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';
import patch from '../../utils/patch.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Phrase extends Base {
  constructor (client) {
    super(client);

    this.phrases = [];

    // Load premade phrases
    fs.readdirSync(path.join(__dirname, '../../../phrases/'))
      .filter((file) => file.endsWith('.json'))
      .forEach((file) =>
        this.load(JSON.parse(fs.readFileSync(path.join(__dirname, `../../../phrases/${file}`), 'utf8'))
          .map((phrase) =>
            (
              {
                ...phrase,
                language: path.parse(file).name
              }
            )
          )
        )
      );

    this.load();
  }

  _local () {
    if (!fs.existsSync(path.join(process.cwd(), '/phrases'))) { return false; }

    const files = fs.readdirSync(path.join(process.cwd(), '/phrases')).filter((file) => file.endsWith('.json'));

    if (!files.length) { return false; }

    for (const file of files) {
      const language = path.parse(file).name;
      const phrases = JSON.parse(fs.readFileSync(path.join(process.cwd(), `/phrases/${file}`), 'utf8'))
        .map((phrase) =>
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

  /**
   * Load list of phrases
   * @param {Phrase[]} phrases
   * @returns {Promise<void>}
   */
  load (phrases) {
    if (!phrases) {
      return this._local();
    }

    phrases = Array.isArray(phrases) ? phrases : [phrases];

    if (!phrases.length) {
      throw new models.WOLFAPIError('phrases cannot be an empty array', { phrases });
    }

    for (const phrase of phrases) {
      if (validator.isNullOrWhitespace(phrase.name)) {
        throw new models.WOLFAPIError('name cannot be null or empty', { phrase });
      }

      if (validator.isNullOrWhitespace(phrase.value)) {
        throw new models.WOLFAPIError('value cannot be null or empty', { phrase });
      }

      if (validator.isNullOrWhitespace(phrase.language)) {
        throw new models.WOLFAPIError('language cannot be null or empty', { phrase });
      }
    }

    for (const phrase of phrases) {
      phrase.name = this.client.utility.string.replace(
        phrase.name,
        {
          keyword: this.client.config.keyword
        }
      );

      const existing = this.phrases.find((phr) => this.client.utility.string.isEqual(phrase.name, phr.name) && phr.language === phrase.language);

      existing ? patch(existing, phrase) : this.phrases.push(phrase);
    }
  }

  /**
   * Get total phrase count and phrases per language
   * @returns {PhraseCount}
   */
  count () {
    const languageCounts = this.phrases.reduce((result, value) => {
      result[value.language] = result[value.language] ? result[value.language]++ : 1;

      return result;
    }, {});

    return new models.PhraseCount(this.phrases.length, languageCounts);
  }

  /**
   * Get all phrases with a specific name
   * @param {String} name
   * @returns {Array<Phrase>}
   */
  getAllByName (name) {
    if (validator.isNullOrWhitespace(name)) {
      throw new models.WOLFAPIError('name cannot be null or empty', { name });
    }

    return this.phrases.filter((phrase) => this.client.utility.string.isEqual(phrase.name, name) || new RegExp(`^${name}_alias([0-9]*)?$`, 'giu').test(phrase.name));
  }

  /**
   * Get a phrase by language and name
   * @param {String} language
   * @param {String} name
   * @returns {String}
   */
  getByLanguageAndName (language, name) {
    if (validator.isNullOrWhitespace(language)) {
      throw new models.WOLFAPIError('language cannot be null or empty', { language });
    }

    if (validator.isNullOrWhitespace(name)) {
      throw new models.WOLFAPIError('name cannot be null or empty', { name });
    }

    const requested = this.phrases.find((phrase) => this.client.utility.string.isEqual(phrase.name, name) && this.client.utility.string.isEqual(phrase.language, language));

    if (requested) {
      return requested.value;
    }

    if (this.client.utility.string.isEqual(language, this.client.config.framework.language)) {
      throw new models.WOLFAPIError('no phrase located', { name });
    }

    return this.getByLanguageAndName(this.client.config.framework.language, name);
  }

  /**
   * Get a phrase by command and name
   * @param {CommandContext} command
   * @param {String} name
   * @returns {String}
   */
  getByCommandAndName (command, name) {
    if (!(command instanceof models.CommandContext)) {
      throw new models.WOLFAPIError('command must be type CommandContext', { command });
    } else if (!Reflect.has(command, 'language')) {
      throw new models.WOLFAPIError('command must contain a language property', { command });
    } else if (validator.isNullOrWhitespace(command.language)) {
      throw new models.WOLFAPIError('language cannot be null or empty', { command });
    }

    if (validator.isNullOrWhitespace(name)) {
      throw new models.WOLFAPIError('name cannot be null or empty', { name });
    }

    return this.getByLanguageAndName(command.language, name);
  }

  /**
   * Check whether or not a string is a specific phrase
   * @param {String} name
   * @param {String} input
   * @returns {boolean}
   */
  isRequestedPhrase (name, input) {
    if (validator.isNullOrWhitespace(name)) {
      throw new models.WOLFAPIError('name cannot be null or empty', { name });
    }

    if (validator.isNullOrWhitespace(input)) {
      throw new models.WOLFAPIError('input cannot be null or empty', { input });
    }

    return this.getAllByName(name).find((phrase) => this.client.utility.string.isEqual(phrase.value, input)) !== undefined;
  }
}

export default Phrase;
