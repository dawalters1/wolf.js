const Base = require('./Base');

class IdHash extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = IdHash;
