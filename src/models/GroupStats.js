const Base = require('./Base');
const GroupStatsActive = require('./GroupStatsActive');
const GroupStatsDetail = require('./GroupStatsDetail');
const GroupStatsTop = require('./GroupStatsTop');
const GroupStatsTrend = require('./GroupStatsTrend');

class GroupStats extends Base {
  constructor (client, data) {
    super(client);

    this.details = new GroupStatsDetail(client, data.details);
    this.next30 = new GroupStatsActive(client, data.next30);
    this.top25 = new GroupStatsTop(client, data.top25);
    this.topAction = new GroupStatsTop(client, data.topAction);
    this.topEmoticon = new GroupStatsTop(client, data.topEmoticon);
    this.topHappy = new GroupStatsTop(client, data.topHappy);
    this.topImage = new GroupStatsTop(client, data.topImage);
    this.topQuestion = new GroupStatsTop(client, data.topQuestion);
    this.topSad = new GroupStatsTop(client, data.topSad);
    this.topSwear = new GroupStatsTop(client, data.topSwear);
    this.topText = new GroupStatsTop(client, data.topText);
    this.topWord = new GroupStatsTop(client, data.topWord);

    this.trends = new GroupStatsTrend(client, data.trends);
    this.trendsDay = new GroupStatsTrend(client, data.trendsDay);
    this.trendsHours = new GroupStatsTrend(client, data.trendsHours);
  }
}

module.exports = GroupStats;
