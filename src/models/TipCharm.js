const Base = require('./Base');

class TipCharm extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = TipCharm;
