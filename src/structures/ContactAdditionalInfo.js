import Base from './Base.js';

class ContactAdditionalInfo extends Base {
  constructor (client, data) {
    super(client);

    this.hash = data?.hash;
    this.nicknameSort = data?.nicknameSort;
    this.privileges = data?.privileges;
    this.onlineState = data?.onlineState;
  }
}

export default ContactAdditionalInfo;
