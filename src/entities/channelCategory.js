import BaseEntity from './baseEntity.js';

export class ChannelCategory extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.description = new Map([entity.languageId, entity.description]);
    this.imageUrl = entity.imageUrl;
    this.name = new Map([entity.languageId, entity.name]);
    this.pageName = new Map([entity.languageId, entity.pageName]);
    this.recipeId = entity.recipeId;
    this.languages = new Set([entity.languageId]);
  }

  /** @internal */
  patch (entity) {
    this.id = entity.id;
    this.description.set(entity.languageId, entity.description);
    this.imageUrl = entity.imageUrl;
    this.name.set(entity.languageId, entity.name);
    this.pageName.set(entity.languageId, entity.pageName);
    this.recipeId = entity.recipeId;
    this.languages.add(entity.languageId);

    return this;
  }

  /** @internal */
  hasLanguage (languageId) {
    return this.languages.has(languageId);
  }
}

export default ChannelCategory;
