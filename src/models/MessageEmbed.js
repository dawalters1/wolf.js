const Base = require('./Base');

class MessageEmbed extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }

  // TODO: Methods
}

module.exports = MessageEmbed;
