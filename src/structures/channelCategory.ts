import BaseEntity from './baseEntity';
import { Language } from '../constants';
import WOLF from '../client/WOLF';

export type ServerGroupCategory = {
    id: number;
    description: string;
    imageUrl: string;
    name: string;
    pageName: string;
    recipeId: number;
    languageId: Language
}

export class ChannelCategory extends BaseEntity {
  id: number;
  description: Map<Language, string> = new Map();
  imageUrl: string;
  name: Map<Language, string> = new Map();
  pageName: Map<Language, string> = new Map();
  recipeId: number;
  languages: Set<Language> = new Set();

  constructor (client: WOLF, data: ServerGroupCategory) {
    super(client);

    this.id = data.id;
    this.description.set(data.languageId, data.description);
    this.imageUrl = data.imageUrl;
    this.name.set(data.languageId, data.name);
    this.pageName.set(data.languageId, data.pageName);
    this.recipeId = data?.recipeId;
    this.languages.add(data.languageId);
  }

  patch (entity: ServerGroupCategory): this {
    this.id = entity.id;
    this.description.set(entity.languageId, entity.description);
    this.imageUrl = entity.imageUrl;
    this.name.set(entity.languageId, entity.name);
    this.pageName.set(entity.languageId, entity.pageName);
    this.recipeId = entity?.recipeId;
    this.languages.add(entity.languageId);

    return this;
  }

  /** @internal */
  hasLanguage (languageId: Language): boolean {
    return this.languages.has(languageId);
  }
}

export default ChannelCategory;
