import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key.ts';
import { Language } from '../constants/Language.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerRole {
  id: number;
  description: string;
  emojiUrl: string;
  name: string;
  hexColur: string;
  languageId: Language
}

export class Role extends BaseEntity {
  @key
    id: number;

  description: Map<Language, string>;
  emojiUrl: string;
  name: Map<Language, string>;
  hexColur: string;
  languages: Set<Language>;

  constructor (client: WOLF, data: ServerRole) {
    super(client);

    this.id = data.id;
    this.description = new Map([[data.languageId, data.description]]);
    this.emojiUrl = data.emojiUrl;
    this.name = new Map([[data.languageId, data.name]]);
    this.hexColur = data.hexColur;
    this.languages = new Set([data.languageId]);
  }

  protected _patch (role: Role): void {
    this.emojiUrl = role.emojiUrl;
    this.hexColur = role.hexColur;

    role.name.forEach((value, key) => this.name.set(key, value));
    role.description.forEach((value, key) => this.description.set(key, value));
    role.languages.forEach((language) => this.languages.add(language));
  }

  /** @internal */
  hasLanguage (languageId: Language): boolean {
    return this.languages.has(languageId);
  }
}
