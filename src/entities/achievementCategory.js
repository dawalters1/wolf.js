import BaseEntity from './baseEntity.js';

export class AchievementCategory extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.name = new Map([[entity.languageId, entity.name]]);
    this.languages = new Set([entity.languageId]);
  }

  /** @internal */
  patch (entity) {
    this.id = entity.id;
    this.name.set(entity.languageId, entity.name);
    this.languages.add(entity.languageId);

    return this;
  }

  /** @internal */
  hasLanguage (languageId) {
    return this.languages.has(languageId);
  }
}

export default AchievementCategory;
