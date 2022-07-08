const Base = require('./Base');
const SubscriberEventAdditionalInfo = require('./SubscriberEventAdditionalInfo');

class SubscriberEvent extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.groupId = data.groupId;

    this.additionalInfo = new SubscriberEventAdditionalInfo(client, data.additionalInfo);
  }
  // TODO: Methods
}

module.exports = SubscriberEvent;
