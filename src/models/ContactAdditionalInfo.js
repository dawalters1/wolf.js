import OnlineState from '../constants/OnlineState.js';
import Base from './Base.js';

class ContactAdditionalInfo extends Base {
  constructor (client, data) {
    super(client);
    this.hash = data?.hash;
    this.nicknameShort = data?.nicknameShort ?? undefined;
    this.onlineState = data?.onlineState ?? OnlineState.OFFLINE;
    this.privileges = data?.privileges ?? 0;
  }
}

export default ContactAdditionalInfo;
