import BaseEntity from './baseEntity';
import { Language } from '../constants';
import WOLF from '../client/WOLF';

export interface ServerChannelCategory {
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

  constructor (client: WOLF, data: ServerChannelCategory) {
    super(client);

    this.id = data.id;
    this.description = this.description.set(data.languageId, data.description);
    this.imageUrl = data?.imageUrl;
    this.name = this.name.set(data.languageId, data.name);
    this.pageName = this.pageName.set(data.languageId, data.pageName);
    this.recipeId = data?.recipeId;
    this.languages.add(data.languageId);
  }

  patch (entity: any): this {
    return this;
  }

  /** @internal */
  hasLanguage (languageId: Language): boolean {
    return this.languages.has(languageId);
  }
}

export default ChannelCategory;
