import AvatarType from '../constants/AvatarType.js';
import BaseEntity from './BaseEntity.js';
import Cache from '../cache/Cache.js';
import ChannelAudioConfig from './ChannelAudioConfig.js';
import ChannelAudioCount from './ChannelAudioCount.js';
import ChannelExtended from './ChannelExtended.js';
import ChannelMemberCache from '../cache/ChannelMemberCache.js';
import { ChannelMemberListType, Language } from '../constants/index.js';
import ChannelMessageConfig from './ChannelMessageConfig.js';
import ChannelOwner from './ChannelOwner.js';
import ChannelRoleFetchType from '../constants/ChannelRoleFetchType.js';
import ChannelRoleStore from '../cache/ChannelRoleCache.js';
import IconInfo from './IconInfo.js';
import { validate } from '../validation/Validation.js';

export default class Channel extends BaseEntity {
  #achievementStore = new Cache();
  #audioSlotRequestStore = new Cache();
  #audioSlotStore = new Cache();
  #eventStore = new Cache();
  #memberStore = new ChannelMemberCache();
  #roleStore = new ChannelRoleStore();
  #slotStore = new Cache();
  #stageStore = new Cache({ ttl: 60 });

  constructor (client, entity) {
    super(client);

    this.id = entity.base.id;
    this.giftAnimationDisabled = entity.base.giftAnimationDisabled;
    this.description = entity.base.description;
    this.name = entity.base.name;
    this.hash = entity.base.hash ?? null;
    this.reputation = entity.base.reputation ?? 0;
    this.premium = entity.base.premium;
    this.icon = entity.base.icon ?? null;
    this.iconHash = entity.base.iconHash ?? null;
    this.iconInfo = entity.base.iconInfo
      ? new IconInfo(client, entity.base.iconInfo, AvatarType.CHANNEL)
      : null;
    this.memberCount = entity.base.members ?? 0;
    this.official = entity.base.official;
    this.peekable = entity.base.peekable;
    this.owner = new ChannelOwner(client, entity.base.owner);
    this.verificationTier = entity.base.verificationTier;

    this.extended = entity.extended
      ? new ChannelExtended(client, entity.extended)
      : null;
    this.audioConfig = entity.audioConfig
      ? new ChannelAudioConfig(client, entity.audioConfig)
      : null;
    this.audioCounts = entity.audioCounts
      ? new ChannelAudioCount(client, entity.audioCounts)
      : null;
    this.messageConfig = entity.messageConfig
      ? new ChannelMessageConfig(client, entity.messageConfig)
      : null;
  }

  /** @internal */
  get achievementStore () {
    return this.#achievementStore;
  }

  /** @internal */
  get audioSlotRequestStore () {
    return this.#audioSlotRequestStore;
  }

  /** @internal */
  get audioSlotStore () {
    return this.#audioSlotStore;
  }

  /** @internal */
  get eventStore () {
    return this.#eventStore;
  }

  /** @internal */
  get isOwner () {
    return this.owner.id === this.client.me.id;
  }

  get language () {
    return this.client.utility.toLanguageKey(this.extended?.language ?? Language.ENGLISH);
  }

  /** @internal */
  get memberStore () {
    return this.#memberStore;
  }

  /** @internal */
  get roleStore () {
    return this.#roleStore;
  }

  /** @internal */
  get slotStore () {
    return this.#slotStore;
  }

  get stageStore () {
    return this.#stageStore;
  }

  async join (password) {
    return await this.client.channel.join(this.id, password);
  }

  async leave () {
    return await this.client.channel.leave(this.id);
  }

  async achievements (parentId, opts) {
    return await this.client.achievement.channel.fetch(this.id, parentId, opts);
  }

  async audioSlot (slotId, opts) {
    return await this.client.audio.slots.fetch(this.id, slotId, opts);
  }

  async audioSlots (opts) {
    return await this.client.audio.slots.fetch(this.id, null, opts);
  }

  async events (opts) {
    return await this.client.event.channel.fetch(this.id, opts);
  }

  async member (memberId, opts) {
    return await this.client.channel.member.fetch(this.id, memberId, opts);
  }

  async members (channelMemberListType, opts) {
    validate(channelMemberListType, this, this.members)
      .in(Object.values(ChannelMemberListType));

    return await this.client.channel.member.fetch(this.id, channelMemberListType, opts);
  }

  async roles (opts) {
    return await this.client.channel.roles.fetch(this.id, ChannelRoleFetchType.ROLES, opts);
  }

  async roleUsers (opts) {
    return await this.client.channel.roles.fetch(this.id, ChannelRoleFetchType.USERS, opts);
  }

  async stages (opts) {
    return await this.client.audio.available(this.id, opts);
  }
}
