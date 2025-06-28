import BaseEntity from './baseEntity.js';

export class ChannelMessageConfig extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.disableImage = entity.disableImage;
    this.disableImageFilter = entity.disableImageFilter;
    this.disableVoice = entity.disableVoice;
    this.disableHyperlink = entity.disableHyperlink;
    this.slowModeRateInSeconds = entity.slowModeRateInSeconds;
  }

  patch (entity) {
    this.disableImage = entity.disableImage;
    this.disableImageFilter = entity.disableImageFilter;
    this.disableVoice = entity.disableVoice;
    this.disableHyperlink = entity.disableHyperlink;
    this.slowModeRateInSeconds = entity.slowModeRateInSeconds;

    return this;
  }
}
export default ChannelMessageConfig;
