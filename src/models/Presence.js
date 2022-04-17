const Base = require('./Base');

class Presence extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }

  async getSubscriber () {
    return await this.api.subscriber.getById(this.id);
  }
}

module.exports = Presence;
