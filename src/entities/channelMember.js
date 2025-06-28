import BaseEntity from './baseEntity.js';
import { ChannelMemberCapability } from '../constants/ChannelMemberCapability.js';
import { ChannelMemberListType } from '../constants/ChannelMemberListType.js';

export class ChannelMember extends BaseEntity {
  constructor (client, entity, source) {
    super(client);

    this.id = entity.id;
    this.hash = entity.hash;
    this.capabilities = entity.capabilities;

    this.lists = new Set(
      [source, this._getParentList(entity.capabilities)].filter(
        (list) => list !== undefined
      )
    );
  }

  patch (entity, list) {
    if ('capabilities' in entity) {
      this.capabilities = entity.capabilities;
      if (list) {
        this.lists.add(list);
      }
    }

    this.id = entity.id;
    this.hash = entity.hash;

    return this;
  }

  _getParentList (capabilities) {
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

  addList (list) {
    this.lists.add(list);
  }

  removeList (list) {
    this.lists.delete(list);
  }
}

export default ChannelMember;
