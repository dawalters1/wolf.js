const Base = require('./Base');

class CharmSubscriberSummary extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = CharmSubscriberSummary;
