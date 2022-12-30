import Base from './Base.js';
import GroupStatsActive from './GroupStatsActive.js';
import GroupStatsDetail from './GroupStatsDetail.js';
import GroupStatsTop from './GroupStatsTop.js';
import GroupStatsTrend from './GroupStatsTrend.js';

class GroupStats extends Base {
  constructor (client, data) {
    super(client);
    this.details = new GroupStatsDetail(client, data?.details);
    this.next30 = (data?.next30 ?? []).map((item) => new GroupStatsActive(client, item));
    this.top25 = (data?.top25 ?? []).map((item) => new GroupStatsActive(client, item));
    this.topAction = (data?.topAction ?? []).map((item) => new GroupStatsTop(client, item));
    this.topEmoticon = (data?.topEmoticon ?? []).map((item) => new GroupStatsTop(client, item));
    this.topHappy = (data?.topHappy ?? []).map((item) => new GroupStatsTop(client, item));
    this.topImage = (data?.topImage ?? []).map((item) => new GroupStatsTop(client, item));
    this.topQuestion = (data?.topQuestion ?? []).map((item) => new GroupStatsTop(client, item));
    this.topSad = (data?.topSad ?? []).map((item) => new GroupStatsTop(client, item));
    this.topSwear = (data?.topSwear ?? []).map((item) => new GroupStatsTop(client, item));
    this.topText = (data?.topText ?? []).map((item) => new GroupStatsTop(client, item));
    this.topWord = (data?.topWord ?? []).map((item) => new GroupStatsTop(client, item));
    this.trends = (data?.trends ?? []).map((item) => new GroupStatsTrend(client, item));
    this.trendsDay = (data?.trendsDay ?? []).map((item) => new GroupStatsTrend(client, item));
    this.trendsHour = (data?.trendsHour ?? []).map((item) => new GroupStatsTrend(client, item));
  }

  toJSON () {
    return {
      details: this.details.toJSON(),
      next30: this.next30.map((item) => item.toJSON()),
      top25: this.top25.map((item) => item.toJSON()),
      topAction: this.topAction.map((item) => item.toJSON()),
      topEmoticon: this.topEmoticon.map((item) => item.toJSON()),
      topHappy: this.topHappy.map((item) => item.toJSON()),
      topImage: this.topImage.map((item) => item.toJSON()),
      topQuestion: this.topQuestion.map((item) => item.toJSON()),
      topSad: this.topSad.map((item) => item.toJSON()),
      topSwear: this.topSwear.map((item) => item.toJSON()),
      topText: this.topText.map((item) => item.toJSON()),
      topWord: this.topWord.map((item) => item.toJSON()),
      trends: this.trends.map((item) => item.toJSON()),
      trendsDay: this.trendsDay.map((item) => item.toJSON()),
      trendsHour: this.trendsHour.map((item) => item.toJSON())
    };
  }
}

export default GroupStats;
