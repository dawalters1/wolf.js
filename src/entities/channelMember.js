
import BaseEntity from './BaseEntity.js';
import { ChannelMemberCapability } from '../constants/ChannelMemberCapability.js';
import { ChannelMemberListType } from '../constants/ChannelMemberListType.js';

export class ChannelMember extends BaseEntity {
  #lists;
  #getList (capabilities) {
    switch (capabilities) {
      case ChannelMemberCapability.OWNER:
      case ChannelMemberCapability.CO_OWNER:
      case ChannelMemberCapability.ADMIN:
      case ChannelMemberCapability.MOD:
        return ChannelMemberListType.PRIVILEGED;
      case ChannelMemberCapability.REGULAR:
        return ChannelMemberListType.REGULAR;
      case ChannelMemberCapability.SILENCED:
        return ChannelMemberListType.SILENCED;
      case ChannelMemberCapability.BANNED:
        return ChannelMemberListType.BANNED;
      default:
        throw new Error('UNSUPPORTED Capability');
    }
  }

  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.channelId = entity.groupId;
    this.hash = entity.hash;
    this.capabilities = entity.capabilities;

    this.#lists = new Set([entity.source, this.#getList(this.capabilities)].filter(Boolean));
  }
}

export default ChannelMember;
