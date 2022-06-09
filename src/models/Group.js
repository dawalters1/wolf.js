const Base = require('./Base');

class Group extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);

    this.exists = Object.keys(data).length > 1;
  }
}

module.exports = Group;
