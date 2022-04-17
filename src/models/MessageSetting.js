const Base = require('./Base');
const SpamFilter = require('./SpamFilter');

class LinkMetadata extends Base {
  constructor (api, data) {
    super(api);

    this.spamFilter = new SpamFilter(api, data);
  }
}

module.exports = LinkMetadata;
