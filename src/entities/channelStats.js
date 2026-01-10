
import BaseEntity from './BaseEntity.js';
import ChannelStatsDetails from './ChannelStatsDetails.js';
import ChannelStatsTop from './ChannelStatsTop.js';
import ChannelStatsTrend from './ChannelStatsTrend.js';

export default class ChannelStats extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.details = new ChannelStatsDetails(this.client, entity.details);
    this.trends = new Set(entity.trends.map((trend) => new ChannelStatsTrend(this.client, trend)));
    this.trendsHour = new Set(entity.trendsHour.map((trend) => new ChannelStatsTrend(this.client, trend)));
    this.trendsDay = new Set(entity.trendsDay.map((trend) => new ChannelStatsTrend(this.client, trend)));
    this.top25 = new Set(entity.top25.map((top25) => new ChannelStatsDetails(this.client, top25)));
    this.next30 = new Set(entity.next30.map((next30) => new ChannelStatsDetails(this.client, next30)));
    this.topWord = new Set(entity.topWord.map((topWord) => new ChannelStatsTop(this.client, topWord)));
    this.topText = new Set(entity.topText.map((topText) => new ChannelStatsTop(this.client, topText)));
    this.topQuestion = new Set(entity.topQuestion.map((topQuestion) => new ChannelStatsTop(this.client, topQuestion)));
    this.topEmoticon = new Set(entity.topEmoticon.map((topEmoticon) => new ChannelStatsTop(this.client, topEmoticon)));
    this.topHappy = new Set(entity.topHappy.map((topHappy) => new ChannelStatsTop(this.client, topHappy)));
    this.topSad = new Set(entity.topSad.map((topSad) => new ChannelStatsTop(this.client, topSad)));
    this.topSwear = new Set(entity.topSwear.map((topSwear) => new ChannelStatsTop(this.client, topSwear)));
    this.topImage = new Set(entity.topWord.map((topImage) => new ChannelStatsTop(this.client, topImage)));
    this.topAction = new Set(entity.topAction.map((topAction) => new ChannelStatsTop(this.client, topAction)));
  }
}
