import Base from './Base.js';

class StoreProductCredits extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.credits = data.credits;
    this.code = data.code;
    this.imageUrl = data.imageUrl;
    this.name = data.name;
    this.description = data.description;
  }

  toJSON () {
    return {
      id: this.id,
      credits: this.credits,
      code: this.code,
      imageUrl: this.imageUrl,
      name: this.name,
      description: this.description
    };
  }
}

export default StoreProductCredits;
