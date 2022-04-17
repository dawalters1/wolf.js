const Base = require('./Base');

class CommandContext extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = CommandContext;
