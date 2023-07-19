import Base from './Base.js';

class ChannelAudioConfig extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.enabled = data?.enabled;
    this.stageId = data?.stageId;
    this.minRepLevel = data?.minRepLevel;
  }

  /**
   * Update the channels audio config
   * @param {Boolean} enabled
   * @param {Number} stageId
   * @param {Number} minRepLevel
   * @returns {Promise<Response>}
   */
  async update ({ enabled, stageId, minRepLevel }) {
    return await this.client.stage.updateAudioConfig(this.id, { enabled, stageId, minRepLevel });
  }
}

export default ChannelAudioConfig;
