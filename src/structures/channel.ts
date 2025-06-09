import AchievementChannel from './achievementChannel.ts';
import BaseEntity from './baseEntity.ts';
import CacheManager from '../managers/cacheManager.ts';
import ChannelAudioConfig, { ServerGroupAudioConfig } from './channelAudioConfig.ts';
import ChannelAudioCount, { ServerGroupAudioCount } from './channelAudioCount.ts';
import { ChannelAudioSlot } from './channelAudioSlot.ts';
import ChannelAudioSlotRequest from './channelAudioSlotRequest.ts';
import ChannelEvent from './channelEvent.ts';
import ChannelExtended, { ServerGroupExtended } from './channelExtended.ts';
import ChannelMember from './channelMember';
import { ChannelMemberCapability } from '../constants/ChannelMemberCapability.ts';
import ChannelMemberManager from '../managers/channelMemberManager.ts';
import ChannelMessageConfig, { ServerGroupMessageConfig } from './channelMessageConfig.ts';
import ChannelOwner, { ServerGroupOwner } from './channelOwner.ts';
import ChannelRole from './channelRole.ts';
import ChannelRoleUser from './channelRoleUser.ts';
import { ChannelVerificationTier } from '../constants/ChannelVerificationTier.ts';
import IconInfo, { ServerIconInfo } from './iconInfo.ts';
import { key } from '../decorators/key.ts';
import { UserPrivilege } from '../constants';
import WOLF from '../client/WOLF.ts';
// import { BaseManager } from '../managers/CacheManager.ts';
// import AchievementChannel from './AchievementChannel.ts';

export interface ServerGroup {
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
  owner: ServerGroupOwner;
  extended?: ServerGroupExtended;
  audioConfig?: ServerGroupAudioConfig;
  audioCount?: ServerGroupAudioCount;
  messageConfig?: ServerGroupMessageConfig
  verificationTier: ChannelVerificationTier;
}

export interface ServerGroupModular {
  base: ServerGroup,
  extended?: ServerGroupExtended;
  audioConfig?: ServerGroupAudioConfig;
  audioCount?: ServerGroupAudioCount;
  messageConfig?: ServerGroupMessageConfig;
}

class Channel extends BaseEntity {
  @key
    id: number;

  name: string;
  hash: string;
  reputation: number;
  premium: boolean;
  icon: number;
  iconHash: string | null;
  iconInfo: IconInfo | null;
  memberCount: number;
  official: boolean;
  peekable: boolean;
  owner: ChannelOwner;
  extended: ChannelExtended | null;
  audioConfig: ChannelAudioConfig | null;
  audioCount: ChannelAudioCount | null;
  messageConfig: ChannelMessageConfig | null;
  verificationTier: ChannelVerificationTier | null;
  achievements: CacheManager<AchievementChannel>;
  events: CacheManager<ChannelEvent>;
  audioSlots: CacheManager<ChannelAudioSlot>;
  audioSlotRequests: CacheManager<ChannelAudioSlotRequest>;
  members: ChannelMemberManager;
  isMember: boolean = false;
  capabilities: ChannelMemberCapability;
  roles: {
    summaries: CacheManager<ChannelRole>,
    users: CacheManager<ChannelRoleUser>
  };

  constructor (client: WOLF, data: ServerGroupModular) {
    super(client);

    this.id = data.base.id;
    this.name = data.base.name;
    this.hash = data.base.hash;
    this.reputation = data.base.reputation;
    this.premium = data.base.premium;
    this.icon = data.base.icon;
    this.iconHash = data.base.iconHash;
    this.iconInfo = data.base.iconInfo
      ? new IconInfo(client, data.base.iconInfo)
      : null;
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
    this.events = new CacheManager();
    this.audioSlots = new CacheManager();
    this.audioSlotRequests = new CacheManager();
    this.capabilities = ChannelMemberCapability.NONE;
    this.members = new ChannelMemberManager();
    this.achievements = new CacheManager();
    this.roles = {
      summaries: new CacheManager(),
      users: new CacheManager()
    };
  }

  patch (entity: ServerGroupModular): this {
    if (entity.base) {
      this.id = entity.base.id;
      this.name = entity.base.name;
      this.hash = entity.base.hash;
      this.reputation = entity.base.reputation;
      this.premium = entity.base.premium;
      this.icon = entity.base.icon;
      this.iconHash = entity.base.iconHash;
      this.iconInfo = entity.base.iconInfo
        ? this.iconInfo
          ? this.iconInfo.patch(entity.base.iconInfo)
          : new IconInfo(this.client, entity.base.iconInfo)
        : null;
      this.memberCount = entity.base.members;
      this.official = entity.base.official;
      this.peekable = entity.base.peekable;
      this.owner = this.owner.patch(entity.base.owner);
      this.verificationTier = entity.base.verificationTier;
    }

    if (entity.extended) {
      this.extended = this.extended
        ? this.extended.patch(entity.extended)
        : new ChannelExtended(this.client, entity.extended);
    }

    if (entity.audioConfig) {
      this.audioConfig = this.audioConfig
        ? this.audioConfig.patch(entity.audioConfig)
        : new ChannelAudioConfig(this.client, entity.audioConfig);
    }
    if (entity.audioCount) {
      this.audioCount = this.audioCount
        ? this.audioCount.patch(entity.audioCount)
        : new ChannelAudioCount(this.client, entity.audioCount);
    }

    if (entity.messageConfig) {
      this.messageConfig = this.messageConfig
        ? this.messageConfig.patch(entity.messageConfig)
        : new ChannelMessageConfig(this.client, entity.messageConfig);
    }

    return this;
  }

  get isOwner () {
    return false;
  //  return this.owner.id === this.client.user.id;
  }

  async join (password: string | null) {
    // return this.client.channel.joinById(this.id, password);
  }

  async getAudioConfig () {
    if (this.audioConfig) {
      return this.audioConfig;
    }

    return (await this.client.channel.getById(this.id, { forceNew: true }))?.audioConfig;
  }

  async getAudioSlots () {
    return this.client.audio.slots.list(this.id);
  }

  hasCapability (required: ChannelMemberCapability): boolean {
    switch (required) {
      case ChannelMemberCapability.CO_OWNER:
        return [ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR, ChannelMemberCapability.NONE, ChannelMemberCapability.BANNED].includes(this.capabilities);
      case ChannelMemberCapability.ADMIN:
        return this.extended?.advancedAdmin
          ? [ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(this.capabilities)
          : [ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(this.capabilities);
      case ChannelMemberCapability.MOD:
        return [ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(this.capabilities);
      default:
        return false;
    }
  }

  async canPerformActionAgainstMember (targetMember: ChannelMember, targetCapability?: ChannelMemberCapability): Promise<boolean> {
    if (targetCapability === ChannelMemberCapability.OWNER) return false;
    if (this.isOwner) return true;

    const sourceMemberHasGap = this.client.me?.privilegeList.includes(UserPrivilege.GROUP_ADMIN) ?? false;

    const hasHigherCapability = (() => {
      switch (this.capabilities) {
        case ChannelMemberCapability.CO_OWNER:
          return [ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR, ChannelMemberCapability.NONE, ChannelMemberCapability.BANNED].includes(targetMember.capabilities);
        case ChannelMemberCapability.ADMIN:
          return this.extended?.advancedAdmin
            ? [ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(targetMember.capabilities)
            : [ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(targetMember.capabilities);
        case ChannelMemberCapability.MOD:
          return [ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED, ChannelMemberCapability.NONE].includes(targetMember.capabilities);
        default:
          return false;
      }
    })();

    const targetUser = await this.client.user.getById(targetMember.id);
    const targetMemberHasGap = targetUser?.privilegeList.includes(UserPrivilege.GROUP_ADMIN) ?? false;

    if (targetCapability &&
      [ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED].includes(targetCapability) &&
    targetMemberHasGap
    ) return false;

    return sourceMemberHasGap || hasHigherCapability;
  };
}

export default Channel;
