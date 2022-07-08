const Base = require('./Base');

class SubscriberEventAdditionalInfo extends Base {
  constructor (client, data) {
    super(client);

    this.eTag = data.eTag;
    this.endsAt = data.endsAt;
    this.startsAt = data.startsAt;
  }
}

module.exports = SubscriberEventAdditionalInfo;
