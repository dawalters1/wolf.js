const Base = require('./Base');

class CharmSelected extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = CharmSelected;
