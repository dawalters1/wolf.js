import BaseEntity from './BaseEntity.js';

export default class ChannelMessageConfig extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.disableImage = entity.disableImage;
    this.disableImageFilter = entity.disableImageFilter;
    this.disableVoice = entity.disableVoice;
    this.disableHyperlink = entity.disableHyperlink;
    this.slowModeRateInSeconds = entity.slowModeRateInSeconds;
  }
}
