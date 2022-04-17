const Base = require('./Base');

class Charm extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }

  async getImage () {
    return await this.api.utility.download(this.imageUrl);
  }
}

module.exports = Charm;
