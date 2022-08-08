import { Base } from './Base.js';

class Search extends Base {
  constructor (client, data) {
    super(client);
    this.searchType = data?.searchType;
    this.id = data?.id;
    this.hash = data?.hash;
    this.reason = data?.reason;
  }
}

export { Search };
