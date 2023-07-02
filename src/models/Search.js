import SearchType from '../constants/SearchType.js';
import Base from './Base.js';

class Search extends Base {
  constructor (client, data) {
    super(client);
    this.type = data?.type;
    this.id = data?.id;
    this.hash = data?.hash;
    this.reason = data?.reason;
  }

  async getProfile () {
    if (this.type === SearchType.CHANNEL) {
      return await this.client.channel.getById(this.id);
    }

    return await this.client.subscriber.getById(this.id);
  }
}

export default Search;
