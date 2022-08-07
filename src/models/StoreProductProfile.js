import Base from './Base.js';
import StoreProductDuration from './StoreProductDuration.js';
import StoreProductImageList from './StoreProductImageList.js';
class StoreProductProfile extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.name = data?.name;
    this.description = data?.description;
    this.durationList = data?.durationList.map((duration) => new StoreProductDuration(duration));
    this.extraInfo = data?.extraInfo;
    this.imageList = data?.imageList.map((image) => new StoreProductImageList(image));
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
}
export default StoreProductProfile;
