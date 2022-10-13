import Base from './Base.js';

class ContactAdditionalInfo extends Base {
  constructor (client, data) {
    super(client);
    this.hash = data?.hash;
    this.nicknameShort = data?.nicknameShort;
    this.onlineState = data?.onlineState;
    this.privileges = data?.privileges;
  }

  toJSON () {
    return {
      hash: this.hash,
      nicknameShort: this.nicknameShort,
      onlineState: this.onlineState,
      privileges: this.privileges
    };
  }
}

export default ContactAdditionalInfo;
