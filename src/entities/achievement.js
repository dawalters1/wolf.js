import BaseEntity from './baseEntity.js';

class Achievement extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.parentId = entity.parentId;
    this.typeId = entity.typeId;
    this.name = new Map([entity.languageId, entity.name]);
    this.description = new Map([entity.languageId, entity.description]);
    this.imageUrl = entity.imageUrl;
    this.category = entity.category;
    this.levelId = entity.levelId;
    this.levelName = new Map([entity.languageId, entity.levelName]);
    this.acquisitionPercentage = entity.acquisitionPercentage;

    /** @internal */
    this.languages = new Set([entity.languageId]);
  }

  /** @internal */
  patch (entity) {
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
  hasLanguage (languageId) {
    return this.languages.has(languageId);
  }
}

export default Achievement;
