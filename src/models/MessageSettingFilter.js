import { Base } from './Base.js';

class MessageSettingFilter extends Base {
  constructor (client, data) {
    super(client);
    this.enabled = data?.enabled;
    this.tier = data?.tier;
  }
}

export { MessageSettingFilter };
