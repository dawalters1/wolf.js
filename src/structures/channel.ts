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
import { ChannelMemberListType } from '../constants/ChannelMemberListType';
import ChannelMemberManager from '../managers/channelMemberManager.ts';
import ChannelMessageConfig, { ServerGroupMessageConfig } from './channelMessageConfig.ts';
import ChannelOwner, { ServerGroupOwner } from './channelOwner.ts';
import ChannelRole from './channelRole.ts';
import ChannelRoleUser from './channelRoleUser.ts';
import ChannelStats from './channelStats';
import { ChannelVerificationTier } from '../constants/ChannelVerificationTier.ts';
import ExpiringProperty from '../managers/expiringProperty';
import IconInfo, { ServerIconInfo } from './iconInfo.ts';
import { key } from '../decorators/key.ts';
import { UserPrivilege } from '../constants';
import WOLF from '../client/WOLF.ts';
// import { BaseManager } from '../managers/CacheManager.ts';
// import AchievementChannel from './AchievementChannel.ts';

export type ServerGroup = {
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

export type ServerGroupModular = {
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
  isMember: boolean = false;
  capabilities: ChannelMemberCapability = ChannelMemberCapability.NONE;

  // #region TTL Management
  _achievements: CacheManager<AchievementChannel> = new CacheManager(300);
  _stats: ExpiringProperty<ChannelStats> = new ExpiringProperty(300);
  // #endregion

  _events: CacheManager<ChannelEvent> = new CacheManager();
  _audioSlots: CacheManager<ChannelAudioSlot> = new CacheManager();
  _audioSlotRequests: CacheManager<ChannelAudioSlotRequest> = new CacheManager();
  _members: ChannelMemberManager = new ChannelMemberManager();
  _roles: {
    summaries: CacheManager<ChannelRole>,
    users: CacheManager<ChannelRoleUser>
  } = {
      summaries: new CacheManager(),
      users: new CacheManager()
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
  }

  async achievements (parentId?: number) {
    return this.client.achievement.channel.get(this.id, parentId);
  }

  async audioSlots () {
    return this.client.audio.slots.list(this.id);
  }

  async audioSlotRequests () {
    return this.client.audio.slotRequest.list(this.id);
  }

  async events () {
    return this.client.event.channel.list(this.id);
  }

  async member (userId: number) {
    return this.client.channel.member.getMember(this.id, userId);
  }

  async members (list: ChannelMemberListType) {
    return this.client.channel.member.getList(this.id, list);
  }

  async roles () {
    return this.client.channel.role.roles(this.id);
  }

  async roleUsers () {
    return this.client.channel.role.users(this.id);
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

  get stats () {
    return this._stats.value;
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
