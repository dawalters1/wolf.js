const Base = require('./Base');

class TipSummary extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = TipSummary;
