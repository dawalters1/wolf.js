const Base = require('./Base');

class TipLeaderboardItem extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }

  async getCharm (langaugeId) {
    return await this.api.charm.getById(this.charmId, langaugeId);
  }

  async getProfile () {
    return this.subscriber ? await this.api.subscriber.getById(this.subscriber.id) : await this.api.group.getById(this.group.id);
  }
}

module.exports = TipLeaderboardItem;
