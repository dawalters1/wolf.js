import Base from './Base.js';
import StoreSectionElementProduct from './StoreSectionElementProduct.js';

class StoreSectionElementProducts extends Base {
  constructor (client, data) {
    super(client);
    this.name = data.name;
    this.products = data.products.map((product) => new StoreSectionElementProduct(client, product));
  }

  toJSON () {
    return {
      name: this.name,
      products: this.products.map((product) => product.toJSON())
    };
  }
}
export default StoreSectionElementProducts;
