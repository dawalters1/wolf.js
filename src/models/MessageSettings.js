import Base from './Base.js';
import MessageSettingFilter from './MessageSettingFilter.js';

class MessageSettings extends Base {
  constructor (client, data) {
    super(client);

    this.spamFilter = new MessageSettingFilter(this.client, data?.spamFilter);
  }
}

export default MessageSettings;
