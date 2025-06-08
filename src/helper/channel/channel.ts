
import BaseHelper from '../baseHelper.ts';
import Channel, { ServerChannelModular } from '../../structures/channel.ts';
import ChannelCategoryHelper from './channelCategory.ts';
import { ChannelListOptions, ChannelOptions, defaultChannelEntities } from '../../options/requestOptions.ts';
import { ChannelMemberCapability } from '../../constants/ChannelMemberCapability.ts';
import ChannelMemberHelper from './channelMember.ts';
import ChannelRoleHelper from './channelRole.ts';
import { Command } from '../../constants/Command.ts';
import WOLF from '../../client/WOLF.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

class ChannelHelper extends BaseHelper<Channel> {
  readonly category: ChannelCategoryHelper;
  readonly member: ChannelMemberHelper;
  readonly role: ChannelRoleHelper;

  constructor (client:WOLF) {
    super(client);

    this.category = new ChannelCategoryHelper(client);
    this.member = new ChannelMemberHelper(client);
    this.role = new ChannelRoleHelper(client);
  }

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
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<ServerChannelModular>>>(
        Command.GROUP_PROFILE,
        {
          headers: {
            version: 4
          },
          body: {
            idList: missingIds,
            subscribe: opts?.subscribe ?? true,
            entities: opts?.entities ?? defaultChannelEntities
          }
        }
      );

      [...response.body.entries()]
        .filter(([channelId, channelResponse]) => channelResponse.success)
        .forEach(([channelId, channelResponse]) => {
          const existing = this.cache.get(channelId);

          channelsMap.set(
            channelId,
            this.cache.set(
              existing
                ? existing.patch(channelResponse.body)
                : new Channel(this.client, channelResponse.body)
            )
          );
        });
    }

    return channelIds.map((channelId) => channelsMap.get(channelId) ?? null);
  }
}

export default ChannelHelper;
