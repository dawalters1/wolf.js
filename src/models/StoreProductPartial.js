import Base from './Base.js';

class StoreProductPartial extends Base {
  constructor (client, data, languageId) {
    super(client);

    this.credits = data.credits;
    this.id = data.id;
    this.languageId = languageId;
    this.imageUrl = data.imageUrl;
    this.isLimited = data.isLimited;
    this.name = data.name;
    this.promotionText = data.promotionText;
    this.reputationLevel = data.reputationLevel;
    this.targetType = data.targetType;

    if (data.charmId) {
      this.charmId = data.charmId;
    }

    if (data.botId) {
      this.botId = data.botId;
    }
  }

  /**
   * Get a products full profile
   * @param {Number} languageId
   * @returns {Promise<StoreProduct>}
   */
  async getFullProduct (languageId) {
    return await this.client.store.getFullProduct(this.id, languageId || this.languageId);
  }
}

export default StoreProductPartial;
