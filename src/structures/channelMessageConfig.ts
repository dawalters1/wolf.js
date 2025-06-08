import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerChannelMessageConfig {
  disableImage: boolean;
  disableImageFilter: boolean;
  disableVoice: boolean;
  disableHyperlink: boolean;
  slowModeRateInSeconds: number;
}

export class ChannelMessageConfig extends BaseEntity {
  disableImage: boolean;
  disableImageFilter: boolean;
  disableVoice: boolean;
  disableHyperlink: boolean;
  slowModeRateInSeconds: number;

  constructor (client: WOLF, data: ServerChannelMessageConfig) {
    super(client);

    this.disableImage = data.disableImage;
    this.disableImageFilter = data.disableImageFilter;
    this.disableVoice = data.disableVoice;
    this.disableHyperlink = data.disableHyperlink;
    this.slowModeRateInSeconds = data.slowModeRateInSeconds;
  }

  patch (entity: ServerChannelMessageConfig): this {
    this.disableImage = entity.disableImage;
    this.disableImageFilter = entity.disableImageFilter;
    this.disableVoice = entity.disableVoice;
    this.disableHyperlink = entity.disableHyperlink;
    this.slowModeRateInSeconds = entity.slowModeRateInSeconds;

    return this;
  }
}
export default ChannelMessageConfig;
