import Base from './Base.js';

class Charm extends Base {
  constructor (client, data) {
    super(client);

    this.cost = data?.cost;
    this.description = data?.description;
    this.id = data?.id;
    this.imageUrl = data?.imageUrl;
    this.name = data?.name;
    this.productId = data?.productId;
  }
}

export default Charm;
