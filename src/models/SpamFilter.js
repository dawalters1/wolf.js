const Base = require('./Base');

class SpamFilter extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = SpamFilter;
