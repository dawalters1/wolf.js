const Base = require('./Base');

class Stage extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }

  async getSchema () {
    // TODO:
  }

  async set () {
    // TODO:
  }

  async getBackground () {
    // TODO:
  }
}

module.exports = Stage;
