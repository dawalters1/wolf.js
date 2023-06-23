import Base from './Base.js';
import ChannelStatsActive from './ChannelStatsActive.js';
import ChannelStatsDetail from './ChannelStatsDetail.js';
import ChannelStatsTop from './ChannelStatsTop.js';
import ChannelStatsTrend from './ChannelStatsTrend.js';

class ChannelStats extends Base {
  constructor (client, data) {
    super(client);
    this.details = new ChannelStatsDetail(client, data?.details);
    this.next30 = (data?.next30 ?? []).map((item) => new ChannelStatsActive(client, item));
    this.top25 = (data?.top25 ?? []).map((item) => new ChannelStatsActive(client, item));
    this.topAction = (data?.topAction ?? []).map((item) => new ChannelStatsTop(client, item));
    this.topEmoticon = (data?.topEmoticon ?? []).map((item) => new ChannelStatsTop(client, item));
    this.topHappy = (data?.topHappy ?? []).map((item) => new ChannelStatsTop(client, item));
    this.topImage = (data?.topImage ?? []).map((item) => new ChannelStatsTop(client, item));
    this.topQuestion = (data?.topQuestion ?? []).map((item) => new ChannelStatsTop(client, item));
    this.topSad = (data?.topSad ?? []).map((item) => new ChannelStatsTop(client, item));
    this.topSwear = (data?.topSwear ?? []).map((item) => new ChannelStatsTop(client, item));
    this.topText = (data?.topText ?? []).map((item) => new ChannelStatsTop(client, item));
    this.topWord = (data?.topWord ?? []).map((item) => new ChannelStatsTop(client, item));
    this.trends = (data?.trends ?? []).map((item) => new ChannelStatsTrend(client, item));
    this.trendsDay = (data?.trendsDay ?? []).map((item) => new ChannelStatsTrend(client, item));
    this.trendsHour = (data?.trendsHour ?? []).map((item) => new ChannelStatsTrend(client, item));
  }
}

export default ChannelStats;
