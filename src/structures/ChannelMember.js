import Capability from '../constants/Capability.js';
import ChannelMemberList from '../constants/ChannelMemberListType.js';
import Base from './Base.js';

class ChannelMember extends Base {
  constructor (client, data, source = undefined) {
    super(client);

    this.id = data?.id;
    this.hash = data?.hash;
    this.capabilities = data?.capabilities;
    this.lists = [source, this._getList(this.capabilities)];
  }

  _getParentList (capabilities) {
    switch (capabilities) {
      case Capability.OWNER:
      case Capability.CO_OWNER:
      case Capability.ADMIN:
      case Capability.MOD:
        return ChannelMemberList.PRIVILEGED;
      case Capability.REGULAR:
        return ChannelMemberList.REGULAR;
      case Capability.SILENCED:
        return ChannelMemberList.SILENCED;
      case Capability.BANNED:
        return ChannelMemberList.BANNED;
      default:
        throw new Error('UNSUPPORTED Capability');
    }
  }

  _addList (list) {
    this.lists.push(list);
  }

  _removeList (list) {
    this.lists.slice(this.lists.indexOf(list), 1);
  }
}

export default ChannelMember;
