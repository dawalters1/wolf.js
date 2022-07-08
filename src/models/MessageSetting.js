const Base = require('./Base');
const MessageSettingFilter = require('./MessageSettingFilter');

class MessageSetting extends Base {
  constructor (client, data) {
    super(client);

    this.spamFilter = new MessageSettingFilter(data.spamFilter);
  }
}

module.exports = MessageSetting;
