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
import { Language, UserPrivilege } from '../constants/index.js';

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
    this.iconInfo = entity.base.iconInfo
      ? new IconInfo(client, entity.base.iconInfo)
      : null;
    this.memberCount = entity.base.members;
    this.official = entity.base.official;
    this.peekable = entity.base.peekable;
    this.owner = new ChannelOwner(client, entity.base.owner);
    this.extended = entity.extended
      ? new ChannelExtended(client, entity.extended)
      : null;
    this.audioConfig = entity.audioConfig
      ? new ChannelAudioConfig(client, entity.audioConfig)
      : null;
    this.audioCount = entity.audioCount
      ? new ChannelAudioCount(client, entity.audioCount)
      : null;
    this.messageConfig = entity.messageConfig
      ? new ChannelMessageConfig(client, entity.messageConfig)
      : null;
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

    this.language = client.utility.toLanguageKey(this?.extended?.language ?? Language.ENGLISH);
  }

  /** @internal */
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

  /**
 * Get method to check if the bot is the owner.
 **
 * @readonly
 * @type {boolean}
 */
  get isOwner () {
    return this.client.me.id === this.owner.id;
  }

  /**
 * Checks if the user has the specified capability based on their role in the channel.
 **
 * @param {*} required The required capability
 * @returns {boolean}
 */
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

  /**
 * Checks if the current user can perform an action against a target member based on their capabilities and privileges.
 **
 * @async
 * @param {*} targetMember The target member to perform the action against
 * @param {*} targetCapability The capability being checked against for the target member
 * @returns {Promise<boolean>}
 */
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

  /**
 * Join a channel with a password.
 **
 * @async
 * @param {*} password Optional - The password for joining the channel
 * @returns {Promise<import('../entities/WOLFResponse.js').default>}
 */
  async join (password) {
    return this.client.channel.joinById(this.id, password);
  }

  /**
 * Leave the channel
 **
 * @async
 * @returns {Promise<WOLFResponse>}
 */
  async leave () {
    return this.client.channel.leaveById(this.id);
  }

  /**
 * Get the channels audio config
 **
 * @async
 * @returns {Promise<import('../entities/channelAudioConfig.js')>}
 */
  async getAudioConfig () {
    if (this.audioConfig) {
      return this.audioConfig;
    }

    const result = await this.client.channel.getById(this.id, { forceNew: true });
    return result?.audioConfig;
  }

  /**
 * Get the channels audio slots
 **
 * @async
 * @returns {Promise<import('../entities/channelAudioSlot.js').default[]>}
 */
  async getAudioSlots () {
    return this.client.audio.slots.list(this.id);
  }

  /**
 * Get the channels achievements
 **
 * @async
 * @param {number} parentId - Optional - The ID of the parent achievement
 * @returns {Promise<import('../entities/achievementChannel.js').default[]>}
 */
  async getAchievements (parentId) {
    return this.client.achievement.channel.get(this.id, parentId);
  }

  /**
 * Get the channels audio slot requests
 **
 * @async
 * @returns {Promise<import('../entities/channelAudioSlotRequest.js').default[]>}
 */
  async getAudioSlotRequests () {
    return this.client.audio.slotRequest.list(this.id);
  }

  /**
 * Get the channels events
 **
 * @async
 * @returns {Promise<import('../entities/channelEvent.js').default[]>}
 */
  async getEvents () {
    return this.client.event.channel.list(this.id);
  }

  /**
 * Get a channel member
 **
 * @async
 * @param {number} userId The user ID of the member
 * @returns {Promise<import('../entities/channelMember.js').default>}
 */
  async getMember (userId) {
    return this.client.channel.member.getMember(this.id, userId);
  }

  /**
 * Get a specified members list
 **
 * @async
 * @param {import('../constants/ChannelMemberListType.js')} list The list parameter.
 * @returns {Promise<import('../entities/channelMember.js').default[]>}
 */
  async getMembers (list) {
    return this.client.channel.member.getList(this.id, list);
  }

  /**
 * Get the available roles
 **
 * @async
 * @returns {Promise<import('../entities/channelRole.js').default[]>}
 */
  async getRoles () {
    return this.client.channel.role.roles(this.id);
  }

  /**
 * Get the users assigned to roles
 **
 * @async
 * @returns {Promise<import('../entities/channelRoleUser.js').default[]>}
 */
  async getRoleUsers () {
    return this.client.channel.role.users(this.id);
  }

  /**
 * Get the available stages
 **
 * @async
 * @returns {Promise<import('../entities/channelStage.js').default[]>}
 */
  async getStages () {
    return this.client.audio.getAvailableList(this.id);
  }
}

export default Channel;
