const Base = require('./Base');

class WelcomeEndpoint extends Base {
  constructor (client, data) {
    super(client);

    this.avatarEndpoint = data.avatarEndpoint;
    this.mmsUploadEndpoint = data.mmsUploadEndpoint;
  }
}

module.exports = WelcomeEndpoint;
