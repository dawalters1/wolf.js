import BaseStore from './BaseStore.js';

class ChannelMemberStore extends BaseStore {
  constructor () {
    super();

    this.metadata = {
      privileged: false,
      regular: false,
      bots: false,
      banned: false,
      silenced: false
    };
  }

  reset () {
    this.metadata = {
      privileged: false,
      regular: false,
      bots: false,
      banned: false,
      silenced: false
    };

    this.clear();
  }
}

export default ChannelMemberStore;
