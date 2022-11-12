import Base from './Base.js';

class StoreSectionElementProduct extends Base {
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

  async getProductProfile (languageId) {
    return await this.client.store.getProductProfile(this.id, languageId || this.languageId);
  }

  toJSON () {
    const props = {
      ...this
    };

    Reflect.deleteProperty(props, 'client');

    return props;
  }
}

export default StoreSectionElementProduct;
