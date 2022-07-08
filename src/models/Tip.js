const Base = require('./Base');
const TipCharm = require('./TipCharm');
const TipContext = require('./TipContext');

class Tip extends Base {
  constructor (client, data) {
    super(client);

    this.charmList = data.charmList.map((charm) => new TipCharm(client, charm));
    this.groupId = data.groupId;
    this.isGroup = !!this.groupId;

    this.sourceSubscriberId = data.sourceSubscriberId;
    this.subscriberId = data.subscriberId;
    this.context = new TipContext(client, data.context);
  }
}

module.exports = Tip;
