import BaseStore from './BaseStore.js';

class ChannelStore extends BaseStore {
  list (isMemberCheck = false) {
    const list = this.store.values();

    return isMemberCheck
      ? list.filter((channel) => channel.isMember)
      : list;
  }

  get (id) {
    if (isNaN(id)) {
      const list = this.list();

      return list.find((channel) => channel.name.toLowerCase().trim() === id.toLowerCase().trim()) ?? null;
    }

    return this.store.get(id);
  }

  set (channel, maxAge = null) {
    return this.store.set(channel, maxAge);
  }

  invalidate (id) {
    if (id instanceof Array) {
      return id.map((id) => this.invalidate(id));
    }

    return this.store.delete(id);
  }
}

export default ChannelStore;
