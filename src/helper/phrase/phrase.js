import Command from '../../commands/Command.js';
import fs from 'node:fs';
import path from 'node:path';
import { validate } from '../../validator/index.js';

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
    { // eslint-disable-line no-lone-blocks
      validate(phrases)
        .each()
        .isValidObject({ name: String, value: String, language: String }, 'PhraseHelper.register() parameter, phrase[{index}]: {value} is not valid');
    }

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
    { // eslint-disable-line no-lone-blocks
      validate(language)
        .isNotNullOrUndefined(`PhraseHelper.getByLanguageAndName() parameter, language: ${language} is null or undefined`)
        .isNotEmptyOrWhitespace(`PhraseHelper.getByLanguageAndName() parameter, language: ${language} is empty or whitespace`);

      validate(name)
        .isNotNullOrUndefined(`PhraseHelper.getByLanguageAndName() parameter, name: ${name} is null or undefined`)
        .isNotEmptyOrWhitespace(`PhraseHelper.getByLanguageAndName() parameter, name: ${name} is empty or whitespace`);
    }

    const requested = this.phrases.find((phrase) => this.client.utility.string.isEqual(phrase.language, language) && this.client.utility.string.isEqual(phrase.name, name));

    if (requested) { return requested.value; };

    const defaultLanguage = this.client.config.framework.commands.language;

    if (!requested && this.client.utility.string.isEqual(language, defaultLanguage)) {
      throw new Error(`Missing phrase: ${name}`);
    }

    return this.getByLanguageAndName(defaultLanguage, name);
  }

  getByCommandAndName (command, name) {
    { // eslint-disable-line no-lone-blocks
      validate(command)
        .isInstanceOf(Command, `PhraseHelper.getByCommandAndName() parameter, command: ${command} is not an instance of Command`);

      validate(name)
        .isNotNullOrUndefined(`PhraseHelper.getByCommandAndName() parameter, name: ${name} is null or undefined`)
        .isNotEmptyOrWhitespace(`PhraseHelper.getByCommandAndName() parameter, name: ${name} is empty or whitespace`);
    }

    return this.getByLanguageAndName(command.language, name);
  }

  getAllByName (name) {
    { // eslint-disable-line no-lone-blocks
      validate(name)
        .isNotNullOrUndefined(`PhraseHelper.getAllByName() parameter, name: ${name} is null or undefined`)
        .isNotEmptyOrWhitespace(`PhraseHelper.getAllByName() parameter, name: ${name} is empty or whitespace`);
    }
    return this.phrases.filter((phrase) => this.client.utility.string.isEqual(phrase.name, name));
  }

  isRequestedPhrase (name, input) {
    { // eslint-disable-line no-lone-blocks
      validate(name)
        .isNotNullOrUndefined(`PhraseHelper.isRequestedPhrase() parameter, name: ${name} is null or undefined`)
        .isNotEmptyOrWhitespace(`PhraseHelper.isRequestedPhrase() parameter, name: ${name} is empty or whitespace`);
      validate(input)
        .isNotNullOrUndefined(`PhraseHelper.isRequestedPhrase() parameter, input: ${input} is null or undefined`)
        .isNotEmptyOrWhitespace(`PhraseHelper.isRequestedPhrase() parameter, input: ${input} is empty or whitespace`);
    }
    const phrases = this.getAllByName(name);

    return phrases.some((phrase) => this.client.utility.string.isEqual(phrase.value, input));
  }
}

export default PhraseHelper;
