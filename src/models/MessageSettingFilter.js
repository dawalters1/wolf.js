import Base from './Base.js';

class MessageSettingFilter extends Base {
  constructor (client, data) {
    super(client);
    this.enabled = data?.enabled;
    this.tier = data?.tier;
  }

  toJSON () {
    return {
      enabled: this.enabled,
      tier: this.tier
    };
  }
}

export default MessageSettingFilter;
