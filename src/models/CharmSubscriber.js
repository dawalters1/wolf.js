const Base = require('./Base');

class CharmSubscriber extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = CharmSubscriber;
