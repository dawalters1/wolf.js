import AvatarType from '../constants/AvatarType.js';
import BaseEntity from './BaseEntity.js';
import Cache from '../cache/Cache.js';
import ChannelAudioConfig from './ChannelAudioConfig.js';
import ChannelAudioCount from './ChannelAudioCount.js';
import ChannelExtended from './ChannelExtended.js';
import ChannelMemberCache from '../cache/ChannelMemberCache.js';
import ChannelMessageConfig from './ChannelMessageConfig.js';
import ChannelOwner from './ChannelOwner.js';
import ChannelRoleStore from '../cache/ChannelRoleCache.js';
import IconInfo from './IconInfo.js';

export default class Channel extends BaseEntity {
  #achievementStore = new Cache();
  #audioSlotStore = new Cache();
  #audioSlotRequestStore = new Cache();
  #eventStore = new Cache();
  #memberStore = new ChannelMemberCache();
  #roleStore = new ChannelRoleStore();
  #slotStore = new Cache();

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
    this.audioCount = entity.audioCount
      ? new ChannelAudioCount(client, entity.audioCount)
      : null;
    this.messageConfig = entity.messageConfig
      ? new ChannelMessageConfig(client, entity.messageConfig)
      : null;
  }

  get achievementStore () {
    return this.#achievementStore;
  }

  get audioSlotStore () {
    return this.#audioSlotStore;
  }

  get audioSlotRequestStore () {
    return this.#audioSlotRequestStore;
  }

  get eventStore () {
    return this.#eventStore;
  }

  get memberStore () {
    return this.#memberStore;
  }

  get roleStore () {
    return this.#roleStore;
  }

  get slotStore () {
    return this.#slotStore;
  }
}
