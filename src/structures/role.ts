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

  description: Map<Language, string> = new Map();
  emojiUrl: string;
  name: Map<Language, string> = new Map();
  hexColur: string;
  languages: Set<Language> = new Set();

  constructor (client: WOLF, data: ServerRole) {
    super(client);

    this.id = data.id;
    this.description.set(data.languageId, data.description);
    this.emojiUrl = data.emojiUrl;
    this.name.set(data.languageId, data.name);
    this.hexColur = data.hexColur;
    this.languages.add(data.languageId);
  }

  patch (entity: ServerRole): this {
    this.id = entity.id;
    this.description.set(entity.languageId, entity.description);
    this.emojiUrl = entity.emojiUrl;
    this.name.set(entity.languageId, entity.name);
    this.hexColur = entity.hexColur;
    this.languages.add(entity.languageId);

    return this;
  }

  /** @internal */
  hasLanguage (languageId: Language): boolean {
    return this.languages.has(languageId);
  }
}
