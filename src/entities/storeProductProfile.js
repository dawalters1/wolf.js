import BaseEntity from './BaseEntity.js';
import StoreProductDuration from './StoreProductDuration.js';
import StoreProductImage from './StoreProductImage.js';

export default class StoreProductProfile extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.languageId = entity.languageId;
    this.name = entity.name;
    this.description = entity.description;
    this.heroImageUrl = entity.heroImageUrl;
    this.webContentUrl = entity.webContentUrl;
    this.typeId = entity.typeId;
    this.targetType = entity.targetType;
    this.userLevel = entity.userLevel;
    this.reputationLevel = entity.reputationLevel;
    this.isStocked = entity.isStocked;
    this.isLimited = entity.isLimited;
    this.isPremium = entity.isPremium;
    this.isRemoved = entity.isRemoved;
    this.durationList = new Set(entity.durationList.map((duration) => new StoreProductDuration(this.client, duration)));
    this.imageList = new Set(entity.imageList.map((image) => new StoreProductImage(this.client, image)));
    this.extraInfo = entity.extraInfo;
    this.recipeId = entity.recipeId;
  }
}
