import BaseEntity from './BaseEntity.js';

export default class StoreProduct extends BaseEntity {
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
  }
}
