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
}

export default ChannelMemberStore;
