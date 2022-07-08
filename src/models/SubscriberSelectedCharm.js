const Base = require('./Base');
const CharmSelected = require('./CharmSelected');

class SubscriberSelectedCharm extends Base {
  constructor (client, data) {
    super(client);

    this.selectedList = (data.selectedList || []).map((selected) => new CharmSelected(client, selected));
  }
}

module.exports = SubscriberSelectedCharm;
