import Base from './Base.js';
import StoreProductDuration from './StoreProductDuration.js';
import StoreProductImageList from './StoreProductImageList.js';

class StoreProductProfile extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.name = data?.name;
    this.description = data?.description;
    this.durationList = data?.durationList.map((duration) => new StoreProductDuration(duration)) ?? [];
    this.extraInfo = data?.extraInfo;
    this.imageList = data?.imageList.map((image) => new StoreProductImageList(image)) ?? [];
    this.isLimited = data?.isLimited;
    this.isPremium = data?.isPremium;
    this.isStocked = data?.isStocked;
    this.promotionText = data?.isStocked;
    this.recipeId = data?.recipeId;
    this.targetType = data?.targetType;
    this.typeId = data?.typeId;
    this.userLevel = data?.userLevel;
    this.webContentUrl = data?.webContentUrl;
    this.heroImageUrl = data?.heroImageUrl;
  }

  toJSON () {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      durationList: this.durationList.map((item) => item.toJSON()),
      extraInfo: this.extraInfo,
      imageList: this.imageList.map((item) => item.toJSON()),
      isLimited: this.isLimited,
      isPremium: this.isPremium,
      isStocked: this.isStocked,
      promotionText: this.promotionText,
      recipeId: this.recipeId,
      targetType: this.targetType,
      typeId: this.typeId,
      userLevel: this.userLevel,
      webContentUrl: this.webContentUrl,
      heroImageUrl: this.heroImageUrl
    };
  }
}

export default StoreProductProfile;
