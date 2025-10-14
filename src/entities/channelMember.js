
import BaseEntity from './baseEntity.js';
import { ChannelMemberCapability } from '../constants/ChannelMemberCapability.js';
import { ChannelMemberListType } from '../constants/ChannelMemberListType.js';

export class ChannelMember extends BaseEntity {
  constructor (client, entity, channelId, source) {
    super(client);

    this.id = entity.id;
    this.channelId = channelId;
    this.hash = entity.hash;
    this.capabilities = entity.capabilities;

    this.lists = new Set(
      [source, this._getParentList(entity.capabilities)].filter(
        (list) => list !== undefined
      )
    );
  }

  /** @internal */
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

  _onCapabilityChange (newCapability) {
    const list = this._getParentList(newCapability);

    if (!this.lists.has(list)) {
      this.lists.delete(this._getParentList(this.capabilities));
      this.lists.add(list);
    }

    this.capabilities = newCapability;
  }

  async regular () {
    return this.client.channel.member.regular(this.channelId, this.id);
  }

  async mod () {
    return this.client.channel.member.mod(this.channelId, this.id);
  }

  async admin () {
    return this.client.channel.member.admin(this.channelId, this.id);
  }

  async coowner () {
    return this.client.channel.member.coowner(this.channelId, this.id);
  }

  async kick () {
    return this.client.channel.member.kick(this.channelId, this.id);
  }

  async ban () {
    return this.client.channel.member.ban(this.channelId, this.id);
  }

  async message (content, opts) {
    return this.client.messaging.sendPrivateMessage(this.id, content, opts);
  }
}

export default ChannelMember;
