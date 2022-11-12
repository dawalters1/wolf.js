import Base from './Base.js';
import StoreSectionElementProduct from './StoreSectionElementProduct.js';

class StoreSectionElementProducts extends Base {
  constructor (client, data, languageId) {
    super(client);
    console.log('LANGUAGE', languageId);
    this.name = data.name;
    this.products = data.products.map((product) => new StoreSectionElementProduct(client, product, languageId));
  }

  toJSON () {
    return {
      name: this.name,
      products: this.products.map((product) => product.toJSON())
    };
  }
}
export default StoreSectionElementProducts;
