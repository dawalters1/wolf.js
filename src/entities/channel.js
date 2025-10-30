import BaseEntity from './baseEntity.js';
import BaseExpireProperty from '../caching/BaseExpireProperty.js';
import BaseStore from '../caching/BaseStore.js';
import ChannelAudioConfig from './channelAudioConfig.js';
import ChannelAudioCount from './channelAudioCount.js';
import ChannelExtended from './channelExtended.js';
import { ChannelMemberCapability } from '../constants/ChannelMemberCapability.js';
import ChannelMemberStore from '../caching/ChannelMemberStore.js';
import ChannelMessageConfig from './channelMessageConfig.js';
import ChannelOwner from './channelOwner.js';
import ChannelRoleStore from '../caching/ChannelRoleStore.js';
import IconInfo from './iconInfo.js';
import { Language, UserPrivilege } from '../constants/index.js';

class Channel extends BaseEntity {
  #achievementStore;
  #statsStore;
  #stageStore;
  #eventStore;
  #audioSlotStore;
  #audioSlotRequestStore;
  #memberStore;
  #roleStore;

  constructor (client, entity) {
    super(client);

    this.id = entity.base.id;
    this.giftAnimationDisabled = entity.base.giftAnimationDisabled;
    this.name = entity.base.name;
    this.hash = entity.base.hash ?? null;
    this.reputation = entity.base.reputation ?? 0;
    this.premium = entity.base.premium;
    this.icon = entity.base.icon ?? null;
    this.iconHash = entity.base.iconHash ?? null;
    this.iconInfo = entity.base.iconInfo
      ? new IconInfo(client, entity.base.iconInfo)
      : null;
    this.memberCount = entity.base.members ?? 0;
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

    this.#achievementStore = new BaseStore({ ttl: 300 });
    this.#statsStore = new BaseExpireProperty({ ttl: 300 });
    this.#stageStore = new BaseStore({ ttl: 300 });
    this.#eventStore = new BaseStore();
    this.#audioSlotStore = new BaseStore();
    this.#audioSlotRequestStore = new BaseStore({ ttl: 300 });
    this.#memberStore = new ChannelMemberStore();
    this.#roleStore = new ChannelRoleStore();

    this.language = client.utility.toLanguageKey(
      this?.extended?.language ?? Language.ENGLISH
    );
  }

  /** @internal */
  get achievementStore () {
    return this.#achievementStore;
  }

  /** @internal */
  get statsStore () {
    return this.#statsStore;
  }

  /** @internal */
  get stageStore () {
    return this.#stageStore;
  }

  /** @internal */
  get eventStore () {
    return this.#eventStore;
  }

  /** @internal */
  get audioSlotStore () {
    return this.#audioSlotStore;
  }

  /** @internal */
  get audioSlotRequestStore () {
    return this.#audioSlotRequestStore;
  }

  /** @internal */
  get memberStore () {
    return this.#memberStore;
  }

  /** @internal */
  get roleStore () {
    return this.#roleStore;
  }

  get isOwner () {
    return this.client.me.id === this.owner.id;
  }

  hasCapability (required) {
    switch (required) {
      case ChannelMemberCapability.CO_OWNER:
        return [
          ChannelMemberCapability.ADMIN,
          ChannelMemberCapability.MOD,
          ChannelMemberCapability.REGULAR,
          ChannelMemberCapability.NONE,
          ChannelMemberCapability.BANNED
        ].includes(this.capabilities);

      case ChannelMemberCapability.ADMIN:
        return this.extended?.advancedAdmin
          ? [
              ChannelMemberCapability.ADMIN,
              ChannelMemberCapability.MOD,
              ChannelMemberCapability.REGULAR,
              ChannelMemberCapability.SILENCED,
              ChannelMemberCapability.BANNED,
              ChannelMemberCapability.NONE
            ].includes(this.capabilities)
          : [
              ChannelMemberCapability.MOD,
              ChannelMemberCapability.REGULAR,
              ChannelMemberCapability.SILENCED,
              ChannelMemberCapability.BANNED,
              ChannelMemberCapability.NONE
            ].includes(this.capabilities);

      case ChannelMemberCapability.MOD:
        return [
          ChannelMemberCapability.REGULAR,
          ChannelMemberCapability.SILENCED,
          ChannelMemberCapability.BANNED,
          ChannelMemberCapability.NONE
        ].includes(this.capabilities);

      default:
        return false;
    }
  }

  async canPerformActionAgainstMember (targetMember, targetCapability) {
    if (targetCapability === ChannelMemberCapability.OWNER) { return false; }
    if (this.isOwner) { return true; }

    const sourceMemberHasGap =
      this.client.me?.privilegeList.includes(UserPrivilege.GROUP_ADMIN) ?? false;

    const hasHigherCapability = (() => {
      switch (this.capabilities) {
        case ChannelMemberCapability.CO_OWNER:
          return [
            ChannelMemberCapability.ADMIN,
            ChannelMemberCapability.MOD,
            ChannelMemberCapability.REGULAR,
            ChannelMemberCapability.NONE,
            ChannelMemberCapability.BANNED
          ].includes(targetMember.capabilities);
        case ChannelMemberCapability.ADMIN:
          return this.extended?.advancedAdmin
            ? [
                ChannelMemberCapability.ADMIN,
                ChannelMemberCapability.MOD,
                ChannelMemberCapability.REGULAR,
                ChannelMemberCapability.SILENCED,
                ChannelMemberCapability.BANNED,
                ChannelMemberCapability.NONE
              ].includes(targetMember.capabilities)
            : [
                ChannelMemberCapability.MOD,
                ChannelMemberCapability.REGULAR,
                ChannelMemberCapability.SILENCED,
                ChannelMemberCapability.BANNED,
                ChannelMemberCapability.NONE
              ].includes(targetMember.capabilities);
        case ChannelMemberCapability.MOD:
          return [
            ChannelMemberCapability.REGULAR,
            ChannelMemberCapability.SILENCED,
            ChannelMemberCapability.BANNED,
            ChannelMemberCapability.NONE
          ].includes(targetMember.capabilities);
        default:
          return false;
      }
    })();

    const targetUser = await this.client.user.getById(targetMember.id);
    const targetMemberHasGap =
      targetUser?.privilegeList.includes(UserPrivilege.GROUP_ADMIN) ?? false;

    if (
      targetCapability &&
      [ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED].includes(targetCapability) &&
      targetMemberHasGap
    ) {
      return false;
    }

    return sourceMemberHasGap || hasHigherCapability;
  }

  async join (password) {
    return this.client.channel.joinById(this.id, password);
  }

  async leave () {
    return this.client.channel.leaveById(this.id);
  }

  async getAudioConfig () {
    if (this.audioConfig) { return this.audioConfig; }
    const result = await this.client.channel.getById(this.id, { forceNew: true });
    return result?.audioConfig;
  }

  async getAudioSlots () {
    return this.client.audio.slots.list(this.id);
  }

  async getAchievements (parentId) {
    return this.client.achievement.channel.get(this.id, parentId);
  }

  async getAudioSlotRequests () {
    return this.client.audio.slotRequest.list(this.id);
  }

  async getEvents () {
    return this.client.event.channel.list(this.id);
  }

  async getMember (userId) {
    return this.client.channel.member.getMember(this.id, userId);
  }

  async getMembers (list) {
    return this.client.channel.member.getList(this.id, list);
  }

  async getRoles () {
    return this.client.channel.roles.roles(this.id);
  }

  async getRoleUsers () {
    return this.client.channel.roles.users(this.id);
  }

  async getStages () {
    return this.client.audio.getAvailableList(this.id);
  }
}

export default Channel;
