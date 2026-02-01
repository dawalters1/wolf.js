import BaseEntity from './BaseEntity.js';
import MessageSettingFilter from './MessageSettingFilter.js';

export default class MessageSetting extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.spamFilter = new MessageSettingFilter(this.client, entity?.spamFilter);
  }
}
