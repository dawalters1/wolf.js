const Base = require('./Base');

class GroupAudioCounts extends Base {
  constructor (client, data) {
    super(client);

    this.broadcasterCount = data.broadcasterCount;
    this.consumerCount = data.consumerCount;
    this.id = data.id;
  }
}

module.exports = GroupAudioCounts;
