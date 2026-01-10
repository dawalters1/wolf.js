import BaseHelper from '../BaseHelper.js';
import ChannelEvent from '../../entities/ChannelEvent.js';

export default class EventChannelHelper extends BaseHelper {
  async fetch (channelId, opts) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    const channel = await this.client.channel.fetch(normalisedChannelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (!opts?.forceNew && channel.eventStore.fetched) { return this.channel.eventStore.values(); }

    const batch = async (results = []) => {
      const response = await this.client.websocket.emit(
        'group event list',
        {
          body: {
            id: normalisedChannelId,
            subscribe: opts?.subscribe ?? true,
            limit: 50,
            offset: results.length
          }
        }
      );

      results.push(...response.body);

      return response.body.length < 50
        ? results
        : await batch(results);
    };

    channel.eventStore.clear();
    channel.eventStore.fetched = true;

    return (await batch()).map((serverGroupEvent) =>
      channel.eventStore.set(new ChannelEvent(this.client, serverGroupEvent))
    );
  }
}
