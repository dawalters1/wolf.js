import BaseEntity from './BaseEntity.js';
import ChannelOwner from './ChannelOwner.js';
import IconInfo from './IconInfo.js';

class Channel extends BaseEntity {
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
      ? new IconInfo(client, entity.base.iconInfo)
      : null;
    this.memberCount = entity.base.members ?? 0;
    this.official = entity.base.official;
    this.peekable = entity.base.peekable;
    this.owner = new ChannelOwner(client, entity.base.owner);
    this.verificationTier = entity.base.verificationTier;
  }
}

export default Channel;
