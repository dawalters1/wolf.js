import Base from './Base.js';
import WOLFAPIError from './WOLFAPIError.js';

class ChannelStage extends Base {
  constructor (client, data, targetChannelId) {
    super(client);

    this.id = data?.id;
    this.expireTime = data?.expireTime;
    this.targetChannelId = targetChannelId;
  }

  async set () {
    if (this.expireTime && new Date(this.expireTime) < Date.now()) {
      throw new WOLFAPIError('stage has expired', { id: this.id, targetChannelId: this.targetChannelId });
    }

    return await this.client.stage.updateAudioConfig(this.targetChannelId, { stageId: this.id });
  }
}

export default ChannelStage;
