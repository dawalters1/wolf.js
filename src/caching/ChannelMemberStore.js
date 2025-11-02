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

  clear () {
    this.metadata = {
      privileged: false,
      regular: false,
      bots: false,
      banned: false,
      silenced: false
    };

    this.store.clear();
    this.fetched = false;
  }
}

export default ChannelMemberStore;
