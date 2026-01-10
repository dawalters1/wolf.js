import FollowerStore from './FollowerStore.js';
import FollowingStore from './FollowingStore.js';

class FollowStore {
  constructor () {
    this.following = new FollowingStore();
    this.followers = new FollowerStore();
  }
}

export default FollowStore;
