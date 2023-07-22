import MessageFilterTier from '../constants/MessageFilterTier.js';
import Base from './Base.js';

class MessageSettingFilter extends Base {
  constructor (client, data) {
    super(client);

    this.enabled = data?.enabled ?? false;
    this.tier = data?.tier ?? MessageFilterTier.OFF;
  }

  /**
   * Update the message filter settings
   * @param {MessageFilterTier} messageFilterTier
   * @returns {Promise<Response>}
   */
  async update (messageFilterTier) {
    return await this.client.misc.updateMessageSettings(messageFilterTier);
  }
}

export default MessageSettingFilter;
