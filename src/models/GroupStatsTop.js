const Base = require('./Base');

class GroupStatsTop extends Base {
  constructor (client, data) {
    super(client);

    this.nickname = data.nickname;
    this.randomQoute = data.randomQoute;
    this.subId = data.subId;
    this.value = data.value;
    this.percentage = data.percentage;
  }
}

module.exports = GroupStatsTop;
