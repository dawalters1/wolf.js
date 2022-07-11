const Base = require('./Base');

class Phrase extends Base {
  constructor (client, data) {
    super(client);

    this.name = data.name;
    this.value = data.value;
    this.language = data.language;
  }
}

module.exports = Phrase;
