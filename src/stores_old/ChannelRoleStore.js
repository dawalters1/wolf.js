import BaseStore from './BaseStore.js';
import Store from './Store.js';

class ChannelRoleStore extends BaseStore {
  get (channelId) {
    return this.store.get(channelId);
  }

  set (channelId, summaries) {
    return this.store.set(channelId, new Store(Map, summaries));
  }

  update (channelId, summary) {
    const summaries = this.get(channelId);

    if (!summaries) { return; };

    return summaries.set(
      summaries.get(summary.roleId)?.patch(summary) ?? summary
    );
  }

  invalidate (channelId, roleIds = null) {
    if (!roleIds) {
      return this.store.delete(channelId);
    }

    const summaries = this.get(channelId);

    return roleIds.map((roleId) => summaries?.delete(roleId));
  }
}

export default ChannelRoleStore;
