import WOLF from '../client/WOLF.ts';
import { Language } from '../constants/Language.ts';
import { key } from '../decorators/key.ts';
import Base from './base.ts';

export interface ServerAchievementCategory {
    id: number;
    languageId: Language;
    name: string;
}

export class AchievementCategory extends Base {
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

  protected _patch (achievementCategory: AchievementCategory): void {
    achievementCategory.name.forEach((value, key) => this.name.set(key, value));
    achievementCategory.languages.forEach((language) => this.languages.add(language));
  }

  /** @internal */
  hasLanguage (languageId: Language): boolean {
    return this.languages.has(languageId);
  }
}

export default AchievementCategory;
