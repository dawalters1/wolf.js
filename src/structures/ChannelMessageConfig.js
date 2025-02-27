import Base from './Base.js';

class ChannelMessageConfig extends Base {
  constructor (client, data) {
    super(client);

    this.disableImage = data?.disableImage;
    this.disableImageFilter = data?.disableImageFilter;
    this.disableVoice = data?.disableVoice;
    this.disableHyperlink = data?.disableHyperlink;
    this.slowModeRateInSeconds = data?.slowModeRateInSeconds;
  }
}

export default ChannelMessageConfig;
