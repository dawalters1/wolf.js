import { Base } from './Base.js';

class StoreSection extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.name = data?.name;
    this.description = data?.description;
    this.type = data?.type;
    this.children = data?.children;
  }
}

export { StoreSection };
