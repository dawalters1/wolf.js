const Base = require('./Base');

class Phrase extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = Phrase;
