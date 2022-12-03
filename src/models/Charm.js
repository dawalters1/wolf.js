import Base from './Base.js';

class Charm extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.name = data?.name;
    this.productId = data?.productId;
    this.imageUrl = data?.imageUrl;
    this.descriptionPhraseId = data?.descriptionPhraseId;
    this.descriptionList = data?.descriptionList;
    this.nameTranslationList = data?.nameTranslationList;
    this.weight = data?.weight;
    this.cost = data?.cost;
    this.exists = Object.keys(data).length > 1;
  }

  toJSON () {
    return {
      id: this.id,
      name: this.name,
      productId: this.productId,
      imageUrl: this.imageUrl,
      descriptionPhraseId: this.descriptionPhraseId,
      descriptionList: this.descriptionList,
      nameTranslationList: this.nameTranslationList,
      weight: this.weight,
      cost: this.cost,
      exists: this.exists
    };
  }
}

export default Charm;
