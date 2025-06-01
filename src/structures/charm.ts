import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key.ts';
import { Language } from '../constants/Language.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerCharm {
  cost: number;
  description: string;
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
  description: Map<Language, string>;
  imageUrl: string;
  name: Map<Language, string>;
  productId: number;
  /** @internal */
  languages: Set<Language>;

  constructor (client: WOLF, data: ServerCharm) {
    super(client);

    this.cost = data.cost;
    this.description = new Map([[data.languageId, data.description]]);
    this.id = data.id;
    this.imageUrl = data.imageUrl;
    this.name = new Map([[data.languageId, data.name]]);
    this.productId = data.productId;

    this.languages = new Set([data.languageId]);
  }

  patch (charm: Charm) {
    this.cost = charm.cost;
    this.imageUrl = charm.imageUrl;
    this.productId = charm.productId;

    charm.name.forEach((value, key) => this.name.set(key, value));
    charm.description.forEach((value, key) => this.description.set(key, value));
    charm.languages.forEach((language) => this.languages.add(language));
    return this;
  }

  /** @internal */
  hasLanguage (languageId: Language): boolean {
    return this.languages.has(languageId);
  }
}
