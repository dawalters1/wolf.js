const Base = require('./Base');

class LinkMetadata extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = LinkMetadata;
