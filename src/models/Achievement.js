const Base = require('./Base');

class Achievement extends Base {
  constructor (api, achievement) {
    super(api);

    this._patch(achievement);
  }

  async getImage () {
    return await this.api.utility.download(this.imageUrl);
  }
}

module.exports = Achievement;
