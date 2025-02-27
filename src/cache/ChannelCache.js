import Base from './Base.js';

class ChannelCache extends Base {
  constructor () {
    super();

    this.fetched = false;
  }

  list () {
    return this.cache.values();
  }

  get (channelId) {
    return this.cache.get(channelId) ?? null;
  }

  set (channels) {
    const result = (Array.isArray(channels) ? channels : [channels])
      .reduce((results, channel) => {
        const existing = this.cache.get(channel.id);

        results.push(
          this.cache.set(
            channel.id,
            existing?._patch(channel) ?? channel

          ).get(channel.id)
        );

        return results;
      }, []);

    return Array.isArray(channels) ? result : result[0];
  }

  delete (channelId) {
    return this.cache.delete(channelId);
  }
}

export default ChannelCache;
