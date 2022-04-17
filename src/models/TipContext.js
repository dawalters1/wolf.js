const Base = require('./Base');

class TipContext extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = TipContext;
