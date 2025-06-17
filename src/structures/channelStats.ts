import BaseEntity from './baseEntity';
import ChannelStatsDetails, { ServerGroupStatsDetails } from './channelStatsDetails';
import ChannelStatsTop, { ServerGroupStatsTop } from './channelStatsTop';
import ChannelStatsTrend, { ServerGroupStatsTrend } from './channelStatsTrend';
import WOLF from '../client/WOLF';

export type ServerGroupStats = {
  details: ServerGroupStatsDetails;
  trendsHour: ServerGroupStatsTrend[];
  trendsDay: ServerGroupStatsTrend[];
  trends: ServerGroupStatsTrend[];
  top25: ServerGroupStatsDetails[];
  next30: ServerGroupStatsDetails[];
  topWord: ServerGroupStatsTop[];
  topText: ServerGroupStatsTop[];
  topQuestion: ServerGroupStatsTop[];
  topEmoticon: ServerGroupStatsTop[];
  topHappy: ServerGroupStatsTop[];
  topSad: ServerGroupStatsTop[];
  topSwear: ServerGroupStatsTop[];
  topImage: ServerGroupStatsTop[];
  topAction: ServerGroupStatsTop[];
}

export class ChannelStats extends BaseEntity {
  details: ChannelStatsDetails;
  trendsHour: ChannelStatsTrend[];
  trendsDay: ChannelStatsTrend[];
  trends: ChannelStatsTrend[];
  top25: ChannelStatsDetails[];
  next30: ChannelStatsDetails[];
  topWord: ChannelStatsTop[];
  topText: ChannelStatsTop[];
  topQuestion: ChannelStatsTop[];
  topEmoticon: ChannelStatsTop[];
  topHappy: ChannelStatsTop[];
  topSad: ChannelStatsTop[];
  topSwear: ChannelStatsTop[];
  topImage: ChannelStatsTop[];
  topAction: ChannelStatsTop[];

  constructor (client: WOLF, data: ServerGroupStats) {
    super(client);

    this.details = new ChannelStatsDetails(this.client, data.details);
    this.trends = data?.trends.map((trend) => new ChannelStatsTrend(this.client, trend));
    this.trendsHour = data?.trendsHour.map((trend) => new ChannelStatsTrend(this.client, trend));
    this.trendsDay = data?.trendsDay.map((trend) => new ChannelStatsTrend(this.client, trend));
    this.top25 = data?.top25.map((top25) => new ChannelStatsDetails(this.client, top25));
    this.next30 = data?.next30.map((next30) => new ChannelStatsDetails(this.client, next30));
    this.topWord = data?.topWord.map((topWord) => new ChannelStatsTop(this.client, topWord));
    this.topText = data?.topText.map((topText) => new ChannelStatsTop(this.client, topText));
    this.topQuestion = data?.topQuestion.map((topQuestion) => new ChannelStatsTop(this.client, topQuestion));
    this.topEmoticon = data?.topEmoticon.map((topEmoticon) => new ChannelStatsTop(this.client, topEmoticon));
    this.topHappy = data?.topHappy.map((topHappy) => new ChannelStatsTop(this.client, topHappy));
    this.topSad = data?.topSad.map((topSad) => new ChannelStatsTop(this.client, topSad));
    this.topSwear = data?.topSwear.map((topSwear) => new ChannelStatsTop(this.client, topSwear));
    this.topImage = data?.topWord.map((topImage) => new ChannelStatsTop(this.client, topImage));
    this.topAction = data?.topAction.map((topAction) => new ChannelStatsTop(this.client, topAction));
  }

  patch (entity: ServerGroupStats) {
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
