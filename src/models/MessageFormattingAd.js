const Base = require('./Base');

class MessageFormattingAd extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = MessageFormattingAd;
