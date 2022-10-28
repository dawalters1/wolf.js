import Base from './Base.js';
import StoreValidity from './StoreValidity.js';

class StoreSectionSimple extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.validity = data?.validity ? new StoreValidity(data.validity) : undefined;
  }
}

export default StoreSectionSimple;
