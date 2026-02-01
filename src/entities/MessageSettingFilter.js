import BaseEntity from './BaseEntity.js';
import MessageFilterTier from '../constants/MessageFilterTier.js';

export default class MessageSettingFilter extends BaseEntity {
  constructor (client, data) {
    super(client);

    this.enabled = data?.enabled ?? false;
    this.tier = data?.tier ?? MessageFilterTier.OFF;
  }

  async update (messageFilterTier) {
    return await this.client.updateMessageSettings(messageFilterTier);
  }
}
