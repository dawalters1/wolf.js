const Base = require('./Base');

class MessageFormattingUrl extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = MessageFormattingUrl;
