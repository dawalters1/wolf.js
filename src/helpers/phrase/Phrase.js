import BaseHelper from '../BaseHelper.js';
import Command from '../../commands/Command.js';
import fs from 'node:fs';
import path from 'node:path';

export default class PhraseHelper extends BaseHelper {
  #opts;
  constructor (client, opts) {
    super(client);
    this.#opts = opts;
    this.reload();
  }

  reload () {
    const phrasePath = path.join(process.cwd(), this.#opts?.paths?.phrases ?? '/phrases');

    if (!fs.existsSync(phrasePath)) { return false; }

    const files = fs.readdirSync(phrasePath).filter((file) => file.endsWith('.json'));

    console.log(files);
    for (const file of files) {
      const language = path.parse(file).name;

      const phrases = JSON.parse(fs.readFileSync(`${phrasePath}/${file}`, 'utf8'))
        .map((phrase) =>
          (
            {
              ...phrase,
              languageId: language
            }
          )
        );

      console.log('registering', language);
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

      const existing = this.store.find((item) => this.client.utility.string.isEqual(item.name, phrase.name) && this.client.utility.string.isEqual(item.languageId, phrase.languageId));

      if (existing) {
        existing.value = phrase.value;
      }

      this.store.set(phrase);
    }
  }

  getByLanguageAndName (language, name) {
    const requested = this.store.find((phrase) => this.client.utility.string.isEqual(phrase.languageId, language) && this.client.utility.string.isEqual(phrase.name, name));

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
