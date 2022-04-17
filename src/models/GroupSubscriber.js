const Base = require('./Base');

class GroupSubscriber extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }

  _updateCapabilities (data) {
    this.capabilities = data;
  }

  _updateAdditionalInfo (data) {
    this.additionalInfo._patch(data);
  }
}

module.exports = GroupSubscriber;
