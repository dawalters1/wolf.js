import Base from './Base.js';
import Validity from './Validity.js';
import WOLFAPIError from './WOLFAPIError.js';

class StoreSection extends Base {
  constructor (client, data, languageId, fromSubPage = false) {
    super(client);

    this.id = data.id;
    this.languageId = languageId;
    this.validity = data.validity ? new Validity(client, data.validity) : undefined;

    const elements = data.elementList;

    const heading = elements.find((element) => element.type === 'heading');
    const images = elements.filter((element) => element.type === 'image');
    const descriptions = elements.filter((element) => element.type === 'text');

    this.title = heading?.properties?.text;
    this.images = images.length > 0 ? images?.map((image) => image.properties.url) : undefined;
    this.description = descriptions[0]?.properties?.text;
    this.additionalDescriptions = descriptions.length > 1 ? descriptions?.slice(1)?.map((description) => description?.properties?.text).filter(Boolean) : undefined;

    const collection = elements.find((element) => element.type === 'collection');

    if (collection) {
      const page = heading?.properties?.link?.url?.split('/').slice(-1)[0];

      (!fromSubPage && page)
        ? this.page = page
        : this.recipe = {
          ...collection.properties.recipe,
          type: collection.properties.type
        };
    }
  }

  async get (offset = 0) {
    if (!this.page && !this.recipe) {
      throw new WOLFAPIError(`${this.title} is not a collection section`, { page: this.toJSON() });
    }

    if (this.page) {
      return await this.client.store._getPage(this.page, this.languageId);
    }

    return await this.client.store.getProducts(this.recipe.id, this.languageId, this.recipe.max, offset, this.recipe.type);
  }

  toJSON () {
    const json = {
      id: this.id,
      languageId: this.languageId,
      validity: this.validity,
      title: this.title,
      images: this.images,
      description: this.description,
      additionalDescriptions: this.additionalDescriptions
    };

    if (this.page) {
      json.page = this.page;
    }

    if (this.recipe) {
      json.recipe = this.recipe;
    }

    return json;
  }
}

export default StoreSection;
