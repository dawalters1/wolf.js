import BaseEntity from './baseEntity.js';

export class Role extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.description = new Map([[entity.languageId, entity.description]]);
    this.emojiUrl = entity.emojiUrl;
    this.name = new Map([[entity.languageId, entity.name]]);
    this.hexColur = entity.hexColur;
    this.languages = new Set([entity.languageId]);
  }

  /** @internal */
  patch (entity) {
    this.id = entity.id;
    this.description.set(entity.languageId, entity.description);
    this.emojiUrl = entity.emojiUrl;
    this.name.set(entity.languageId, entity.name);
    this.hexColur = entity.hexColur;
    this.languages.add(entity.languageId);

    return this;
  }

  /** @internal */
  hasLanguage (languageId) {
    return this.languages.has(languageId);
  }
}
