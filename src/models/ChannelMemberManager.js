
class ChannelMemberManager {
  constructor () {
    this._metadata = {
      privileged: false,
      regular: false,
      bots: false,
      banned: false,
      silenced: false
    };

    this._members = new Map();
  }
}

export default ChannelMemberManager;
