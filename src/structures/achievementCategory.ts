import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key.ts';
import { Language } from '../constants/Language.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerAchievementCategory {
  id: number;
  languageId: Language;
  name: string;
}

export class AchievementCategory extends BaseEntity {
  @key
    id: number;

  name: Map<Language, string> = new Map();
  /** @internal */
  languages: Set<Language> = new Set();

  constructor (client: WOLF, data: ServerAchievementCategory) {
    super(client);

    this.id = data.id;
    this.name.set(data.languageId, data.name);
    this.languages.add(data.languageId);
  }

  patch (entity: ServerAchievementCategory): this {
    this.id = entity.id;
    this.name.set(entity.languageId, entity.name);
    this.languages.add(entity.languageId);

    return this;
  }

  /** @internal */
  hasLanguage (languageId: Language): boolean {
    return this.languages.has(languageId);
  }
}

export default AchievementCategory;
