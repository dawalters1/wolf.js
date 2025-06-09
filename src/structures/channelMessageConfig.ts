import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerGroupMessageConfig {
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

  constructor (client: WOLF, data: ServerGroupMessageConfig) {
    super(client);

    this.disableImage = data.disableImage;
    this.disableImageFilter = data.disableImageFilter;
    this.disableVoice = data.disableVoice;
    this.disableHyperlink = data.disableHyperlink;
    this.slowModeRateInSeconds = data.slowModeRateInSeconds;
  }

  patch (entity: ServerGroupMessageConfig): this {
    this.disableImage = entity.disableImage;
    this.disableImageFilter = entity.disableImageFilter;
    this.disableVoice = entity.disableVoice;
    this.disableHyperlink = entity.disableHyperlink;
    this.slowModeRateInSeconds = entity.slowModeRateInSeconds;

    return this;
  }
}
export default ChannelMessageConfig;
