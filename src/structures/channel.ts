import WOLF from '../client/WOLF.ts';
import Base from './base.ts';
import ChannelOwner, { ServerChannelOwner } from './channelOwner.ts';
import ChannelExtended, { ServerChannelExtended } from './channelExtended.ts';
import ChannelAudioConfig, { ServerChannelAudioConfig } from './channelAudioConfig.ts';
import ChannelAudioCount, { ServerChannelAudioCount } from './channelAudioCount.ts';
import ChannelMessageConfig, { ServerChannelMessageConfig } from './channelMessageConfig.ts';
import IconInfo, { ServerIconInfo } from './iconInfo.ts';
import { ChannelVerificationTier } from '../constants/ChannelVerificationTier.ts';
import { key } from '../decorators/key.ts';
import CacheManager from '../managers/cacheManager.ts';
import ChannelEvent from './channelEvent.ts';
import { ChannelMemberCapability } from '../constants/ChannelMemberCapability.ts';
import ChannelMemberManager from '../managers/channelMemberManager.ts';
import { ChannelAudioSlot } from './channelAudioSlot.ts';
import ChannelAudioSlotRequest from './channelAudioSlotRequest.ts';
// import { BaseManager } from '../managers/CacheManager.ts';
// import AchievementChannel from './AchievementChannel.ts';

export interface ServerChannel {
  id: number;
  name: string;
  hash: string;
  reputation: number;
  premium: boolean;
  icon: number;
  iconHash: string;
  iconInfo: ServerIconInfo
  members: number;
  official: boolean;
  peekable: boolean;
  owner: ServerChannelOwner;
  extended?: ServerChannelExtended;
  audioConfig?: ServerChannelAudioConfig;
  audioCount?: ServerChannelAudioCount;
  messageConfig?: ServerChannelMessageConfig
  verificationTier: ChannelVerificationTier;
}

export interface ServerChannelModular {
  base: ServerChannel,
  extended?: ServerChannelExtended;
  audioConfig?: ServerChannelAudioConfig;
  audioCount?: ServerChannelAudioCount;
  messageConfig?: ServerChannelMessageConfig;
}

class Channel extends Base {
  @key
    id: number;

  name: string;
  hash: string;
  reputation: number;
  premium: boolean;
  icon: number;
  iconHash: string;
  iconInfo: IconInfo;
  memberCount: number;
  official: boolean;
  peekable: boolean;
  owner: ServerChannelOwner;
  extended: ChannelExtended | null;
  audioConfig?: ChannelAudioConfig | null;
  audioCount?: ChannelAudioCount | null;
  messageConfig?: ChannelMessageConfig | null;
  verificationTier: ChannelVerificationTier | null;
  // achievements: BaseManager<AchievementChannel>;
  events: CacheManager<ChannelEvent, Map<number, ChannelEvent>>;
  audioSlots: CacheManager<ChannelAudioSlot, Map<number, ChannelAudioSlot>>;
  audioSlotRequests: CacheManager<ChannelAudioSlotRequest, Map<number, ChannelAudioSlotRequest>>;
  members: ChannelMemberManager;
  isMember: boolean = false;
  capabilities: ChannelMemberCapability;

  constructor (client: WOLF, data: ServerChannelModular) {
    super(client);

    this.id = data.base.id;
    this.name = data.base.name;
    this.hash = data.base.hash;
    this.reputation = data.base.reputation;
    this.premium = data.base.premium;
    this.icon = data.base.icon;
    this.iconHash = data.base.iconHash;
    this.iconInfo = new IconInfo(client, data.base.iconInfo);
    this.memberCount = data.base.members;
    this.official = data.base.official;
    this.peekable = data.base.peekable;
    this.owner = new ChannelOwner(client, data.base.owner);
    this.extended = data?.extended
      ? new ChannelExtended(client, data.extended)
      : null;
    this.audioConfig = data?.audioConfig
      ? new ChannelAudioConfig(client, data.audioConfig)
      : null;
    this.audioCount = data?.audioCount
      ? new ChannelAudioCount(client, data.audioCount)
      : null;
    this.messageConfig = data?.messageConfig
      ? new ChannelMessageConfig(client, data.messageConfig)
      : null;
    this.verificationTier = data.base.verificationTier;
    this.events = new CacheManager(new Map());
    this.audioSlots = new CacheManager(new Map());
    this.audioSlotRequests = new CacheManager(new Map());
    this.capabilities = ChannelMemberCapability.NONE;
    this.members = new ChannelMemberManager();
  }

  get isOwner () {
    return false;
  //  return this.owner.id === this.client.user.id;
  }

  async join (password: string | null) {
    // return this.client.channel.joinById(this.id, password);
  }
}

export default Channel;
