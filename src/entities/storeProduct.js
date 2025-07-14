import BaseEntity from './baseEntity.js';

class StoreProduct extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.name = new Map([[entity.languageId, entity.name]]);
    this.name.set(entity.languageId, entity.name);
    this.targetType = entity.targetType;
    this.imageUrl = entity.imageUrl;
    this.credits = entity.credits;
    this.reputationLevel = entity.reputationLevel;
    this.promotionText = new Map([[entity.languageId, entity.promotionText]]);
    this.isLimited = entity.isLimited;
    this.botId = entity.botId;
    this.charmId = entity.charmId;
    this.languages = new Set([entity.languageId]);

    this.profile = undefined;
  }

  /** @internal */
  patch (entity) {
    this.id = entity.id;
    this.name.set(entity.languageId, entity.name);
    this.targetType = entity.targetType;
    this.imageUrl = entity.imageUrl;
    this.credits = entity.credits;
    this.reputationLevel = entity.reputationLevel;
    this.promotionText.set(entity.languageId, entity.promotionText);
    this.isLimited = entity.isLimited;
    this.botId = entity.botId;
    this.charmId = entity.charmId;
    this.languages.add(entity.languageId);
    return this;
  }

  /** @internal */
  hasLanguage (languageId) {
    return this.languages.has(languageId);
  }
}

export default StoreProduct;
