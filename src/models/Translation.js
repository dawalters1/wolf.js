const Base = require('./Base');

class Translation extends Base {
  constructor (client, data) {
    super(client);

    this.languageId = data.languageId;
    this.text = data.text;
  }
}

module.exports = Translation;
