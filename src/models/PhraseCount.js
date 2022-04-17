const Base = require('./Base');

class PhraseCount extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = PhraseCount;
