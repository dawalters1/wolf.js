const Base = require('./Base');

class MessageSettingFilter extends Base {
  constructor (client, data) {
    super(client);

    this.enabled = data.enabled;
    this.tier = data.tier;
  }
}

module.exports = MessageSettingFilter;
