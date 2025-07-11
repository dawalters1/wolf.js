import BaseEntity from './baseEntity.js';
import ChannelStatsOwner from './channelStatsOwner.js';

export class ChannelStatsDetails extends BaseEntity {
    constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.actionCount = entity.actionCount;
    this.emoticonCount = entity.emoticonCount;
    this.channelId = entity.groupId;
    this.happyEmoticonCount = entity.happyEmoticonCount;
    this.imageCount = entity.imageCount;
    this.lineCount = entity.lineCount;
    this.memberCount = entity.memberCount;
    this.name = entity.name;
    this.owner = entity.owner
      ? new ChannelStatsOwner(this.client, entity.owner)
      : undefined;
    this.message = entity.message;
    this.nickname = entity.nickname;
    this.packCount = entity.packCount;
    this.questionCount = entity.questionCount;
    this.randomQuote = entity.randomQuote;
    this.sadEmoticonCount = entity.sadEmoticonCount;
    this.userId = entity.subId;
    this.swearCount = entity.swearCount;
    this.textCount = entity.textCount;
    this.voiceCount = entity.voiceCount;
    this.wordCount = entity.wordCount;
  }
}

export default ChannelStatsDetails;
