const Base = require('./Base');

class MessageEdit extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }

  async getSubscriber () {
    return await this.api.subscriber.getById(this.subscriberId);
  }
}

module.exports = MessageEdit;
