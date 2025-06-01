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

  name: Map<Language, string>;
  /** @internal */
  languages: Set<Language>;

  constructor (client: WOLF, data: ServerAchievementCategory) {
    super(client);

    this.id = data.id;
    this.name = new Map([[data.languageId, data.name]]);
    this.languages = new Set([data.languageId]);
  }

  patch (achievementCategory: AchievementCategory) {
    achievementCategory.name.forEach((value, key) => this.name.set(key, value));
    achievementCategory.languages.forEach((language) => this.languages.add(language));
    return this;
  }

  /** @internal */
  hasLanguage (languageId: Language): boolean {
    return this.languages.has(languageId);
  }
}

export default AchievementCategory;
