import Base from './Base.js';

class Charm extends Base {
  constructor (client, data, languageId) {
    super(client);

    this.cost = data?.cost;
    this.description = data?.description
      ? new Map().set(languageId, data.description)
      : undefined;
    this.id = data?.id;
    this.imageUrl = data?.imageUrl;
    this.name = data?.name
      ? new Map().set(languageId, data.name)
      : undefined;
    this.productId = data?.productId;
  }

  _hasLanguage (languageId) {
    return this.description.has(languageId) &&
    this.name.has(languageId);
  }

  _patch (data, languageId) {
    this.description.set(languageId, data.description.get(languageId));
    this.name.set(languageId, data.name.get(languageId));
  }
}

export default Charm;
