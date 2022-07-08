const Base = require('./Base');

class GroupStatsTrend extends Base {
  constructor (client, data) {
    super(client);

    this.day = data.day;
    this.hour = data.hour;
    this.lineCount = data.lineCount;
  }
}

module.exports = GroupStatsTrend;
