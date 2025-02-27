import Base from './Base.js';

class ChannelAudioConfig extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.enabled = data?.enabled;
    this.stageId = data?.stageId;
    this.minRepLevel = data?.minRepLevel;
  }
}

export default ChannelAudioConfig;
