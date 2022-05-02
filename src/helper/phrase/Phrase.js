const Base = require('../Base');

class Phrase extends Base {
  constructor (client) {
    super(client);

    this._phrases = [];
  }
}

module.exports = Phrase;
