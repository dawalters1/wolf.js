const Base = require('./Base');

class TipDetail extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = TipDetail;
