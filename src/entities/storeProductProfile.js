import BaseEntity from './baseEntity.js';
import StoreProductDuration from './storeProductDuration.js';
import StoreProductImage from './storeProductImage.js';

class StoreProductProfile extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.name = new Map();
    this.name.set(entity.languageId, entity.name);
    this.description = new Map();
    this.description.set(entity.languageId, entity.description);
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
    this.durationList = new Set(entity.durationList.map(d => new StoreProductDuration(this.client, d)));
    this.imageList = new Set(entity.imageList.map(i => new StoreProductImage(this.client, i)));
    this.extraInfo = entity.extraInfo;
    this.recipeId = new Map([entity.languageId, entity.recipeId]);
    this.languages = new Set([entity.languageId]);
  }

  patch (entity) {
    this.id = entity.id;
    this.name.set(entity.languageId, entity.name);
    this.description.set(entity.languageId, entity.description);
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
    this.durationList = new Set(entity.durationList.map(d => new StoreProductDuration(this.client, d)));
    this.imageList = new Set(entity.imageList.map(i => new StoreProductImage(this.client, i)));
    this.extraInfo = entity.extraInfo;
    this.recipeId.set(entity.languageId, entity.recipeId);
    this.languages.add(entity.languageId);
    return this;
  }

  hasLanguage (languageId) {
    return this.languages.has(languageId);
  }
}

export default StoreProductProfile;
