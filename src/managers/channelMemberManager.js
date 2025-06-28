import CacheManager from './cacheManager.js';

class ChannelMemberManager extends CacheManager {
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

export default ChannelMemberManager;
