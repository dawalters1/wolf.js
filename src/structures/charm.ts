import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key.ts';
import { Language } from '../constants/Language.ts';
import WOLF from '../client/WOLF.ts';

export type ServerCharm = {
  cost: number;
  description: string | null;
  languageId: Language;
  id: number;
  imageUrl: string;
  name: string;
  productId: number
}

export class Charm extends BaseEntity {
  @key
    id: number;

  cost: number;
  description: Map<Language, string | null> = new Map();
  imageUrl: string;
  name: Map<Language, string> = new Map();
  productId: number;
  /** @internal */
  languages: Set<Language> = new Set();

  constructor (client: WOLF, data: ServerCharm) {
    super(client);

    this.cost = data.cost;
    this.description.set(data.languageId, data.description);
    this.id = data.id;
    this.imageUrl = data.imageUrl;
    this.name.set(data.languageId, data.name);
    this.productId = data.productId;

    this.languages.add(data.languageId);
  }

  patch (entity: any): this {
    this.cost = entity.cost;
    this.description.set(entity.languageId, entity.description);
    this.id = entity.id;
    this.imageUrl = entity.imageUrl;
    this.name.set(entity.languageId, entity.name);
    this.productId = entity.productId;

    this.languages.add(entity.languageId);

    return this;
  }

  /** @internal */
  hasLanguage (languageId: Language): boolean {
    return this.languages.has(languageId);
  }
}
