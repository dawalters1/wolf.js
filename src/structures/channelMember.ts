import BaseEntity from './baseEntity.ts';
import { ChannelMemberCapability } from '../constants/ChannelMemberCapability.ts';
import { ChannelMemberListType } from '../constants/ChannelMemberListType.ts';
import { key } from '../decorators/key.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerChannelMember {
  id: number;
  hash: string;
  capabilities: ChannelMemberCapability
}

export class ChannelMember extends BaseEntity {
  @key
    id: number;

  hash: string;
  capabilities: ChannelMemberCapability;
  lists: Set<string>;

  constructor (client: WOLF, data: ServerChannelMember) {
    super(client);

    this.id = data.id;
    this.hash = data.hash;
    this.capabilities = data.capabilities;

    this.lists = new Set();
  }

  _getParentList (capabilities: ChannelMemberCapability) {
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

  addList (list: string) {
    this.lists.add(list);
  }

  removeList (list: string) {
    this.lists.delete(list);
  }
}
export default ChannelMember;
