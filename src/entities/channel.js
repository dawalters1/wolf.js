import BaseEntity from './baseEntity.js';
import CacheManager from '../managers/cacheManager.js';
import ChannelAudioConfig from './channelAudioConfig.js';
import ChannelAudioCount from './channelAudioCount.js';
import ChannelExtended from './channelExtended.js';
import { ChannelMemberCapability } from '../constants/ChannelMemberCapability.js';
import ChannelMemberManager from '../managers/channelMemberManager.js';
import ChannelMessageConfig from './channelMessageConfig.js';
import ChannelOwner from './channelOwner.js';
import ExpiringProperty from '../managers/expiringProperty.js';
import IconInfo from './iconInfo.js';
import { UserPrivilege } from '../constants/index.js';

class Channel extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.base.id;
    this.name = entity.base.name;
    this.hash = entity.base.hash;
    this.reputation = entity.base.reputation;
    this.premium = entity.base.premium;
    this.icon = entity.base.icon;
    this.iconHash = entity.base.iconHash;
    this.iconInfo = entity.base.iconInfo ? new IconInfo(client, entity.base.iconInfo) : null;
    this.memberCount = entity.base.members;
    this.official = entity.base.official;
    this.peekable = entity.base.peekable;
    this.owner = new ChannelOwner(client, entity.base.owner);
    this.extended = entity.extended ? new ChannelExtended(client, entity.extended) : null;
    this.audioConfig = entity.audioConfig ? new ChannelAudioConfig(client, entity.audioConfig) : null;
    this.audioCount = entity.audioCount ? new ChannelAudioCount(client, entity.audioCount) : null;
    this.messageConfig = entity.messageConfig ? new ChannelMessageConfig(client, entity.messageConfig) : null;
    this.verificationTier = entity.base.verificationTier;

    this.isMember = false;
    this.capabilities = ChannelMemberCapability.NONE;

    this._achievements = new CacheManager(300);
    this._stats = new ExpiringProperty(300);
    this._stages = new CacheManager(300);
    this._events = new CacheManager();
    this._audioSlots = new CacheManager();
    this._audioSlotRequests = new CacheManager();
    this._members = new ChannelMemberManager();

    this._roles = {
      summaries: new CacheManager(),
      users: new CacheManager()
    };
  }

  async achievements (parentId) {
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

  async member (userId) {
    return this.client.channel.member.getMember(this.id, userId);
  }

  async members (list) {
    return this.client.channel.member.getList(this.id, list);
  }

  async roles () {
    return this.client.channel.role.roles(this.id);
  }

  async roleUsers () {
    return this.client.channel.role.users(this.id);
  }

  async stages () {
    return this.client.audio.getAvailableList(this.id);
  }

  patch (entity) {
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
    return false; // Implement ownership logic if needed
  }

  async join (password) {
    return this.client.channel.joinById(this.id, password);
  }

  async getAudioConfig () {
    if (this.audioConfig) {
      return this.audioConfig;
    }

    const result = await this.client.channel.getById(this.id, { forceNew: true });
    return result?.audioConfig;
  }

  async getAudioSlots () {
    return this.client.audio.slots.list(this.id);
  }

  hasCapability (required) {
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

  async canPerformActionAgainstMember (targetMember, targetCapability) {
    if (targetCapability === ChannelMemberCapability.OWNER) { return false; }
    if (this.isOwner) { return true; }

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

    if (
      targetCapability &&
      [ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED].includes(targetCapability) &&
      targetMemberHasGap
    ) {
      return false;
    }

    return sourceMemberHasGap || hasHigherCapability;
  }
}

export default Channel;
