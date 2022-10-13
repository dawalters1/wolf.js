import Base from './Base.js';

class StoreProduct extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.isLimited = data?.isLimited;
    this.name = data?.name;
    this.targetType = data?.targetType;
    this.reputationLevel = data?.reputationLevel;
    this.promotionText = data?.promotionText;
    this.imageUrl = data?.imageUrl;
    this.credits = data?.credits;

    if (Reflect.has(data, 'botId')) {
      this.botId = data?.botId;
    }

    if (Reflect.has(data, 'charmId')) {
      this.charmId = data?.charmId;
    }
  }

  toJSON () {
    const json = {
      id: this.id,
      isLimited: this.isLimited,
      name: this.name,
      targetType: this.targetType,
      reputationLevel: this.reputationLevel,
      promotionText: this.promotionText,
      imageUrl: this.imageUrl,
      credits: this.credits
    };

    if (this.botId) {
      json.botId = this.botId;
    }

    if (this.charmId) {
      json.charmId = this.charmId;
    }

    return json;
  }
}

export default StoreProduct;
