const Base = require('./Base');
const Subscriber = require('./Subscriber');

class Welcome extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);

    this.loggedInUser = this.loggedInUser ? new Subscriber(api, data.loggedInUser) : undefined;
  }
}

module.exports = Welcome;
