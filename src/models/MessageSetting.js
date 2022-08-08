import { Base } from './Base.js';
import { MessageSettingFilter } from './MessageSettingFilter.js';

class MessageSetting extends Base {
  constructor (client, data) {
    super(client);
    this.spamFilter = new MessageSettingFilter(data?.spamFilter);
  }
}

export { MessageSetting };
