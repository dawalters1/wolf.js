import Base from './Base.js';

class Search extends Base {
  constructor (client, data) {
    super(client);
    this.type = data?.type;
    this.id = data?.id;
    this.hash = data?.hash;
    this.reason = data?.reason;
  }

  toJSON () {
    return {
      type: this.type,
      id: this.id,
      hash: this.hash,
      reason: this.reason
    };
  }
}

export default Search;
