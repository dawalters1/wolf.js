
const Base = require('./Base');

class Search extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }

  async getProfile () {
    return this.type === 'subscriber' ? await this.api.subscriber.getById(this.id) : await this.api.group.getById(this.id);
  }
}

module.exports = Search;
