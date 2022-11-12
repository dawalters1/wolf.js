import Base from './Base.js';
import models from './index.js';
import StoreSectionElement from './StoreSectionElement.js';
import StoreSectionElementProducts from './StoreSectionElementProducts.js';
import Validity from './Validity.js';

class StoreSection extends Base {
  constructor (client, data) {
    super(client);
    this.id = data.id;
    this.validity = data.validity ? new Validity(client, data.validity) : undefined;
    this.elements = data?.elementList.map((element) => new StoreSectionElement(client, element));
  }

  async get () {
    const heading = this.elements.find((element) => element.type === 'heading');
    const languageId = this.client.utility.toLanguageId(heading.properties?.context?.split('_').slice(-1)[0]);
    const page = heading?.properties?.link?.url?.split('/').slice(-1)[0];

    if (!page) {
      const collection = this.elements.find((element) => element.type === 'collection');

      if (!collection) {
        throw new models.WOLFAPIError('Not a store page or product page');
      }

      return new StoreSectionElementProducts(
        this.client,
        {
          name: heading.properties.text,
          products: await this.client.store.getProducts(collection.properties.recipe.id, languageId, collection.properties.recipe.max, 0, collection.properties.type)
        }
      );
    }

    return await this.client.store._getPage(page, languageId);
  }

  toJSON () {
    return {
      id: this.id,
      validity: this.validity?.toJSON(),
      elements: this.elements?.map((element) => element.toJSON()) ?? []
    };
  }
}

export default StoreSection;
