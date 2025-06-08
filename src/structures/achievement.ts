import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key.ts';
import { Language } from '../constants/Language.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerAchievement {
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
  name: Map<Language, string> = new Map();
  description: Map<Language, string> = new Map();
  imageUrl: string;
  category: number;
  levelId: number;
  levelName: Map<Language, string> = new Map();
  acquisitionPercentage: number;

  /** @internal */
  languages: Set<Language> = new Set();

  constructor (client: WOLF, data: ServerAchievement) {
    super(client);

    this.id = data.id;
    this.parentId = data.parentId;
    this.typeId = data.typeId;
    this.name.set(data.languageId, data.name);
    this.description.set(data.languageId, data.description);
    this.imageUrl = data.imageUrl;
    this.category = data.category;
    this.levelId = data.levelId;
    this.levelName.set(data.languageId, data.levelName);
    this.acquisitionPercentage = data.acquisitionPercentage;

    this.languages.add(data.languageId);
  }

  patch (entity: ServerAchievement): this {
    this.id = entity.id;
    this.parentId = entity.parentId;
    this.typeId = entity.typeId;
    this.name.set(entity.languageId, entity.name);
    this.description.set(entity.languageId, entity.description);
    this.imageUrl = entity.imageUrl;
    this.category = entity.category;
    this.levelId = entity.levelId;
    this.levelName.set(entity.languageId, entity.levelName);
    this.acquisitionPercentage = entity.acquisitionPercentage;

    this.languages.add(entity.languageId);

    return this;
  }

  /** @internal */
  hasLanguage (languageId: Language): boolean {
    return this.languages.has(languageId);
  }
}

export default Achievement;
