import BaseEntity from './BaseEntity.js';

export default class ChannelAudioConfig extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.enabled = entity.enabled ?? false;
    this.stageId = entity.stageId ?? 1;
    this.minRepLevel = entity.minRepLevel ?? 0;
  }
}
