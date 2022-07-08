const Base = require('./Base');

class ContactAdditionalInfo extends Base {
  constructor (client, data) {
    super(client);

    this.hash = data.hash;
    this.nicknameShort = data.nicknameShort;
    this.onlineState = data.onlineState;
    this.privilieges = data.privilieges;
  }
}

module.exports = ContactAdditionalInfo;
