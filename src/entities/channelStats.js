import BaseEntity from './baseEntity.js';
import ChannelStatsDetails from './channelStatsDetails.js';
import ChannelStatsTop from './channelStatsTop.js';
import ChannelStatsTrend from './channelStatsTrend.js';

export class ChannelStats extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.details = new ChannelStatsDetails(this.client, entity.details);
    this.trends = entity.trends.map((trend) => new ChannelStatsTrend(this.client, trend));
    this.trendsHour = entity.trendsHour.map((trend) => new ChannelStatsTrend(this.client, trend));
    this.trendsDay = entity.trendsDay.map((trend) => new ChannelStatsTrend(this.client, trend));
    this.top25 = entity.top25.map((top25) => new ChannelStatsDetails(this.client, top25));
    this.next30 = entity.next30.map((next30) => new ChannelStatsDetails(this.client, next30));
    this.topWord = entity.topWord.map((topWord) => new ChannelStatsTop(this.client, topWord));
    this.topText = entity.topText.map((topText) => new ChannelStatsTop(this.client, topText));
    this.topQuestion = entity.topQuestion.map((topQuestion) => new ChannelStatsTop(this.client, topQuestion));
    this.topEmoticon = entity.topEmoticon.map((topEmoticon) => new ChannelStatsTop(this.client, topEmoticon));
    this.topHappy = entity.topHappy.map((topHappy) => new ChannelStatsTop(this.client, topHappy));
    this.topSad = entity.topSad.map((topSad) => new ChannelStatsTop(this.client, topSad));
    this.topSwear = entity.topSwear.map((topSwear) => new ChannelStatsTop(this.client, topSwear));
    this.topImage = entity.topWord.map((topImage) => new ChannelStatsTop(this.client, topImage));
    this.topAction = entity.topAction.map((topAction) => new ChannelStatsTop(this.client, topAction));
  }

  patch (entity) {
    this.details = new ChannelStatsDetails(this.client, entity.details);
    this.trends = entity?.trends.map((trend) => new ChannelStatsTrend(this.client, trend));
    this.trendsHour = entity?.trendsHour.map((trend) => new ChannelStatsTrend(this.client, trend));
    this.trendsDay = entity?.trendsDay.map((trend) => new ChannelStatsTrend(this.client, trend));
    this.top25 = entity?.top25.map((top25) => new ChannelStatsDetails(this.client, top25));
    this.next30 = entity?.next30.map((next30) => new ChannelStatsDetails(this.client, next30));
    this.topWord = entity?.topWord.map((topWord) => new ChannelStatsTop(this.client, topWord));
    this.topText = entity?.topText.map((topText) => new ChannelStatsTop(this.client, topText));
    this.topQuestion = entity?.topQuestion.map((topQuestion) => new ChannelStatsTop(this.client, topQuestion));
    this.topEmoticon = entity?.topEmoticon.map((topEmoticon) => new ChannelStatsTop(this.client, topEmoticon));
    this.topHappy = entity?.topHappy.map((topHappy) => new ChannelStatsTop(this.client, topHappy));
    this.topSad = entity?.topSad.map((topSad) => new ChannelStatsTop(this.client, topSad));
    this.topSwear = entity?.topSwear.map((topSwear) => new ChannelStatsTop(this.client, topSwear));
    this.topImage = entity?.topWord.map((topImage) => new ChannelStatsTop(this.client, topImage));
    this.topAction = entity?.topAction.map((topAction) => new ChannelStatsTop(this.client, topAction));

    return this;
  }
}

export default ChannelStats;
