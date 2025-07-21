import fs from 'node:fs';
import path from 'node:path';

class PhraseHelper {
  constructor (client) {
    this.client = client;
    this.phrases = [];

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

      const existing = this.phrases.find((p) => this.client.utility.string.isEqual(p.name, phrase.name) && this.client.utility.string.isEqual(p.language, phrase.language));

      existing
        ? existing.value = phrase.value
        : this.phrases.push(phrase);
    }
  }

  getByLanguageAndName (language, name) {
    const requested = this.phrases.find((phrase) => this.client.utility.string.isEqual(phrase.language, language) && this.client.utility.string.isEqual(phrase.name, name));

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
    return this.phrases.filter((phrase) => this.client.utility.string.isEqual(phrase.name, name));
  }

  isRequestedPhrase (name, input) {
    const phrases = this.getAllByName(name);

    return phrases.some((phrase) => this.client.utility.string.isEqual(phrase.value, input));
  }
}

export default PhraseHelper;
