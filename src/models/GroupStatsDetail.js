import Base from './Base.js';

class GroupStatsDetail extends Base {
  constructor (client, data) {
    super(client);
    this.actionCount = data?.acountCount;
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

  toJSON () {
    return {
      actionCount: this.actionCount,
      emoticonCount: this.emoticonCount,
      id: this.id,
      happyCount: this.happyCount,
      imageCount: this.imageCount,
      lineCount: this.lineCount,
      memberCount: this.memberCount,
      name: this.name,
      owner: this.owner,
      packCount: this.packCount,
      sadCount: this.sadCount,
      spokenCount: this.spokenCount,
      swearCount: this.swearCount,
      textCount: this.textCount,
      voiceCount: this.voiceCount,
      wordCount: this.wordCount,
      timestamp: this.timestamp
    };
  }
}

export default GroupStatsDetail;
