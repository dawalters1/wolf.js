import Base from './Base.js';

class ChannelStatsDetail extends Base {
  constructor (client, data) {
    super(client);
    this.actionCount = data?.actionCount;
    this.emoticonCount = data?.emoticonCount;
    this.id = data?.id;
    this.happyCount = data?.happyCount;
    this.imageCount = data?.imageCount;
    this.lineCount = data?.lineCount;
    this.memberCount = data?.memberCount;
    this.name = data?.name;
    this.owner = data?.owner;
    this.packCount = data?.packCount;
    this.questionCount = data?.questionCount;
    this.spokenCount = data?.spokenCount;
    this.sadCount = data?.sadCount;
    this.swearCount = data?.swearCount;
    this.textCount = data?.textCount;
    this.voiceCount = data?.voiceCount;
    this.wordCount = data?.wordCount;
    this.timestamp = data?.timestamp;
  }
}

export default ChannelStatsDetail;
