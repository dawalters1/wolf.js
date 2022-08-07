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
    this.nameTranslationList = data?.nameList;
    this.weight = data?.weight;
    this.cost = data?.cost;
  }
}
export default Charm;
