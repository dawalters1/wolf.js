const { Command } = require('../../constants');
const Base = require('../Base');

// const validator = require('../../validator');
// const WOLFAPIError = require('../../models/WOLFAPIError');
// const { Command } = require('../../constants');

// const models = require('../../models');

class Subscription extends Base {
  async getSubscriptionList () {
    if (this.cache.length) {
      return this.cache;
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_LIST,
      {
        subscribe: true
      }
    );
  }
}

module.exports = Subscription;
