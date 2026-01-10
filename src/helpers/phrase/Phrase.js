import BaseHelper from '../BaseHelper.js';
import Command from '../../commands/Command.js';
import fs from 'node:fs';
import path from 'node:path';
import { validate } from '../../validator/index.js';

class PhraseHelper extends BaseHelper {
  constructor (client) {
    super(client);

    this.reload();
  }

  reload () {
    if (!fs.existsSync(path.join(process.cwd(), '/phrases'))) { return false; }

    const files = fs.readdirSync(path.join(process.cwd(), '/phrases')).filter((file) => file.endsWith('.json'));

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

      this.register(phrases);
    }
  }

  register (phrases) {
    for (const phrase of phrases) {
      phrase.name = this.client.utility.string.replace(
        phrase.name,
        {
          keyword: this.client.config.keyword
        }
      );

      const existing = this.store.find((item) => this.client.utility.string.isEqual(item.name, phrase.name) && this.client.utility.string.isEqual(item.language, phrase.language));

      if (existing) {
        existing.value = phrase.value;
      }

      this.store.set(phrase);
    }
  }

  getByLanguageAndName (language, name) {
    const requested = this.store.find((phrase) => this.client.utility.string.isEqual(phrase.language, language) && this.client.utility.string.isEqual(phrase.name, name));

    if (requested) { return requested.value; };

    const defaultLanguage = this.client.config.framework.commands.language;

    if (!requested && this.client.utility.string.isEqual(language, defaultLanguage)) {
      throw new Error(`Missing phrase: ${name}`);
    }

    return this.getByLanguageAndName(defaultLanguage, name);
  }

  getByCommandAndName (command, name) {
    return this.getByLanguageAndName(command.language, name);
  }

  getAllByName (name) {
    return this.store.filter((phrase) => this.client.utility.string.isEqual(phrase.name, name));
  }

  isRequestedPhrase (name, input) {
    const phrases = this.getAllByName(name);

    return phrases.some((phrase) => this.client.utility.string.isEqual(phrase.value, input));
  }
}

export default PhraseHelper;
