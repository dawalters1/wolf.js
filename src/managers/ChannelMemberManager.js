import DataManager from './DataManager.js';

class ChannelMemberManager extends DataManager {
  constructor () {
    super();

    this._metadata = {
      privileged: false,
      regular: false,
      bots: false,
      banned: false,
      silenced: false
    };
  }
}

export default ChannelMemberManager;
