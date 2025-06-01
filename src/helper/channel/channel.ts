
import BaseHelper from '../baseHelper.ts';
import Channel from '../../structures/channel.ts';
import { ChannelListOptions, ChannelOptions, defaultChannelEntities } from '../../options/requestOptions.ts';
import { ChannelMemberCapability } from '../../constants/ChannelMemberCapability.ts';
import { Command } from '../../constants/Command.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

class ChannelHelper extends BaseHelper<Channel> {
  async list (opts?: ChannelListOptions) {
    if (!opts?.forceNew && this.cache.fetched) {
      return this.cache.values().filter((channel) => channel.isMember);
    }

    const response = await this.client.websocket.emit<any[]>(
      Command.SUBSCRIBER_GROUP_LIST,
      {
        body: {
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    this.cache.fetched = true;

    if (response.body.length) {
      const channels = await this.getByIds(response.body.map((serverChannel) => serverChannel.id as number));

      channels
        .filter((channel): channel is Channel => channel !== null)
        .forEach((channel, index) => {
          channel.isMember = true;
          channel.capabilities = response.body[index].capabilities as ChannelMemberCapability;
        }
        );
    }

    return this.cache.values().filter((channel) => channel.isMember);
  }

  async getById (channelId: number, opts?: ChannelOptions): Promise<Channel | null> {
    return (await this.getByIds([channelId], opts))[0];
  }

  async getByIds (channelIds: number[], opts?: ChannelOptions): Promise<(Channel | null)[]> {
    const channelsMap = new Map<number, Channel | null>();

    // User is not requesting new data from server
    if (!opts?.forceNew) {
      const cachedChannels = this.cache.getAll(channelIds)
        .filter((channel): channel is Channel => channel !== null);

      cachedChannels.forEach((channel) => channelsMap.set(channel.id, channel));
    }

    const missingIds = channelIds.filter((id) => !channelsMap.has(id));

    if (missingIds.length) {
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<Channel>>>(
        Command.GROUP_PROFILE,
        {
          body: {
            idList: missingIds,
            subscribe: opts?.subscribe ?? true,
            entities: opts?.entities ?? defaultChannelEntities
          }
        }
      );

      response.body.values().filter((channelResponse) => channelResponse.success)
        .forEach((channelResponse) => channelsMap.set(channelResponse.body.id, this.cache.set(channelResponse.body)));
    }

    return channelIds.map((channelId) => channelsMap.get(channelId) ?? null);
  }
}

export default ChannelHelper;
