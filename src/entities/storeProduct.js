import BaseEntity from './baseEntity.js';

class StoreProduct extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.languageId = entity.languageId;
    this.name = entity.name;
    this.name = entity.name;
    this.targetType = entity.targetType;
    this.imageUrl = entity.imageUrl;
    this.credits = entity.credits;
    this.reputationLevel = entity.reputationLevel;
    this.promotionText = entity.promotionText;
    this.isLimited = entity.isLimited;
    this.botId = entity.botId;
    this.charmId = entity.charmId;

    this.profile = undefined;
  }

  /** @internal */
  patch (entity) {
    this.id = entity.id;
    this.name = entity.name;
    this.targetType = entity.targetType;
    this.imageUrl = entity.imageUrl;
    this.credits = entity.credits;
    this.reputationLevel = entity.reputationLevel;
    this.promotionText = entity.promotionText;
    this.isLimited = entity.isLimited;
    this.botId = entity.botId;
    this.charmId = entity.charmId;

    return this;
  }
}

export default StoreProduct;
