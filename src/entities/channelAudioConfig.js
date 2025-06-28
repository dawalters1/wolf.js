import BaseEntity from './baseEntity.js';

class ChannelAudioConfig extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.enabled = entity.enabled;
    this.stageId = entity.stageId;
    this.minRepLevel = entity.minRepLevel;
  }

  patch (entity) {
    this.id = entity.id;
    this.enabled = entity.enabled;
    this.stageId = entity.stageId;
    this.minRepLevel = entity.minRepLevel;
    return this;
  }
}

export default ChannelAudioConfig;
