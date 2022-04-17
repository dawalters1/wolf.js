const Base = require('./Base');

class CharmSubscriberStatistics extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = CharmSubscriberStatistics;
