import Base from './Base.js';

class GroupAudioConfig extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.enabled = data?.enabled;
    this.stageId = data?.stageId;
    this.minRepLevel = data?.minRepLevel;
  }

  toJSON () {
    return {
      id: this.id,
      enabled: this.enabled,
      stageId: this.stageId,
      minRepLevel: this.minRepLevel
    };
  }
}

export default GroupAudioConfig;
