import Base from './Base.js';

class GroupAudioConfig extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.enabled = data?.enabled;
    this.stageId = data?.stageId;
    this.minRepLevel = data?.minRepLevel;
  }

  async update ({ enabled, stageId, minRepLevel }) {
    return await this.client.stage.updateAudioConfig(this.id, { enabled, stageId, minRepLevel });
  }
}

export default GroupAudioConfig;
