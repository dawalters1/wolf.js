import Cache from './Cache.js';

export default class ChannelMemberCache extends Cache {
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
