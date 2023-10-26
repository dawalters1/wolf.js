import Base from './Base.js';

class ChannelMessageConfig extends Base {
  constructor (client, data) {
    super(client);
    this.disableHyperlink = data?.disableHyperlink;
    this.disableImage = data?.disableImage;
    this.disableImageFilter = data?.disableImageFilter;
    this.disableVoice = data?.disableVoice;
    this.id = data?.id;
    this.slowModeRateInSeconds = data?.slowModeRateInSeconds;
  }

  /**
   * Update the message config
   * @param {Boolean} disableHyperlink
   * @param {Boolean} disableImage
   * @param {Boolean} disableImageFilter
   * @param {Boolean} disableVoice
   * @param {number} slowModeRateInSeconds
   * @returns {Promise<Response>}
   */
  async update ({ disableHyperlink, disableImage, disableImageFilter, disableVoice, slowModeRateInSeconds }) {
    return await this.client.channel.update(this.id, { disableHyperlink, disableImage, disableVoice, disableImageFilter, slowModeRateInSeconds });
  }
}

export default ChannelMessageConfig;
