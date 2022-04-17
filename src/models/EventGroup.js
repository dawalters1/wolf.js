const Base = require('./Base');

class EventGroup extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = EventGroup;
