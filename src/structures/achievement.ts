import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key.ts';
import { Language } from '../constants/Language.ts';
import WOLF from '../client/WOLF.ts';

interface ServerAchievement {
  id: number;
  languageId: Language;
  parentId: number | null;
  typeId: number;
  name: string;
  description: string;
  imageUrl: string;
  category: number;
  levelId: number;
  levelName: string;
  acquisitionPercentage: number;
}

class Achievement extends BaseEntity {
  @key
    id: number;

  parentId: number | null;
  typeId: number;
  name: Map<Language, string>;
  description: Map<Language, string>;
  imageUrl: string;
  category: number;
  levelId: number;
  levelName: Map<Language, string>;
  acquisitionPercentage: number;
  /** @internal */
  languages: Set<Language>;

  constructor (client: WOLF, data: ServerAchievement) {
    super(client);

    this.id = data.id;
    this.parentId = data.parentId;
    this.typeId = data.typeId;
    this.name = new Map([[data.languageId, data.name]]);
    this.description = new Map([[data.languageId, data.description]]);
    this.imageUrl = data.imageUrl;
    this.category = data.category;
    this.levelId = data.levelId;
    this.levelName = new Map([[data.languageId, data.levelName]]);
    this.acquisitionPercentage = data.acquisitionPercentage;

    this.languages = new Set([data.languageId]);
  }

  patch (achievement: Achievement) {
    this.parentId = achievement.parentId;
    this.typeId = achievement.typeId;
    this.imageUrl = achievement.imageUrl;
    this.category = achievement.category;
    this.levelId = achievement.levelId;
    this.acquisitionPercentage = achievement.acquisitionPercentage;

    achievement.name.forEach((value, key) => this.name.set(key, value));
    achievement.description.forEach((value, key) => this.description.set(key, value));
    achievement.levelName.forEach((value, key) => this.levelName.set(key, value));
    achievement.languages.forEach((language) => this.languages.add(language));

    return this;
  }

  /** @internal */
  hasLanguage (languageId: Language): boolean {
    return this.languages.has(languageId);
  }
}

export default Achievement;
