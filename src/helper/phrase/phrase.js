import fs from 'node:fs';
import path from 'node:path';

function isEqual (a, b) {
  const removeDiacritics = str =>
    str
      .normalize('NFD') // Handles Latin accents
      .replace(/[\u0300-\u036f]/g, '') // Remove Latin combining marks
      .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Remove Arabic diacritics
      .toLowerCase();

  return removeDiacritics(a) === removeDiacritics(b);
}

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

      const existing = this.phrases.find((p) => isEqual(p.name, phrase.name) && isEqual(p.language === phrase.language));

      existing
        ? existing.phrase = phrase.value
        : this.phrases.push(phrase);
    }
  }

  getByLanguageAndName (language, name) {
    const requested = this.phrases.find((phrase) => isEqual(phrase.language, language) && isEqual(phrase.name, name));

    if (requested) { return requested.value; };

    const defaultLanguage = this.client.config.framework.commands.language;

    if (!requested && isEqual(language, defaultLanguage)) {
      throw new Error(`Missing phrase: ${name}`);
    }

    return this.getByLanguageAndName(defaultLanguage, name);
  }

  getByCommandAndName (command, name) {
    return this.getByLanguageAndName(command.language, name);
  }

  getAllByName (name) {
    return this.phrases.filter((phrase) => isEqual(phrase.name, name));
  }

  isRequestedPhrase (name, input) {
    const phrases = this.getAllByName(name);

    return phrases.some((phrase) => isEqual(phrase.value, input));
  }
}

export default PhraseHelper;
