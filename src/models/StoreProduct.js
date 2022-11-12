import Base from './Base.js';
import StoreProductDuration from './StoreProductDuration.js';
import StoreProductImage from './StoreProductImage.js';

class StoreProduct extends Base {
  constructor (client, data, languageId) {
    super(client);

    this.languageId = languageId;
    this.id = data.id;
    this.durationList = data.durationList.map((duration) => new StoreProductDuration(client, duration));
    this.extraInfo = data.extraInfo;
    this.heroImageUrl = data.heroImageUrl;
    this.imageList = data.imageList?.map((image) => new StoreProductImage(client, image));
    this.isLimited = data.isLimited;
    this.isRemoved = data.isRemoved;
    this.isStocked = data.isStocked;
    this.name = data.name;
    this.promotionText = data.promotionText;
    this.recipeId = data.recipeId;
    this.reputationLevel = data.reputationLevel;
    this.targetType = data.targetType;
    this.typeId = data.typeId;
    this.userLevel = data.userLevel;
    this.webContentUrl = data.webContentUrl;
  }

  async purchase (duration, quanitity, targetIds) {
    if (!(duration instanceof (await import('./StoreProductDuration.js')).default)) {
      return await duration.purchase(quanitity, targetIds);
    }

    return await this.client.store.purchase(duration, quanitity, targetIds);
  }

  toJSON () {
    return {
      id: this.id,
      languageId: this.languageId,
      durationList: this.durationList.map((duration) => duration.toJSON()),
      extraInfo: this.extraInfo,
      heroImageUrl: this.heroImageUrl,
      imageList: this.imageList?.map((image) => image.toJSON()),
      isLimited: this.isLimited,
      isRemoved: this.isRemoved,
      isStocked: this.isStocked,
      name: this.name,
      promotionText: this.promotionText,
      recipeId: this.recipeId,
      reputationLevel: this.reputationLevel,
      targetType: this.targetType,
      typeId: this.typeId,
      userLevel: this.userLevel,
      webContentUrl: this.webContentUrl
    };
  }
}

export default StoreProduct;
