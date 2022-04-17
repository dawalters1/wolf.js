const Base = require('./Base');

class MessageResponse extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = MessageResponse;
