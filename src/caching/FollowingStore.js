import BaseExpireProperty from './BaseExpireProperty.js';
import BaseStore from './BaseStore.js';

class FollowingStore {
  constructor () {
    this.count = new BaseExpireProperty({ ttl: 15 });
    this.list = new BaseStore({ ttl: 3600 });
  }
}

export default FollowingStore;
