import Capability from '../constants/Capability.js';
import MemberListType from '../constants/MemberListType.js';
import Base from './Base.js';

class ChannelMember extends Base {
  constructor (client, data, source = undefined) {
    super(client);

    this.id = data?.id;
    this.targetChannelId = data?.targetGroupId;
    this.targetGroupId = this.targetChannelId;
    this.hash = data?.hash;
    this.capabilities = data?.capabilities;

    this.lists = new Set([source, this._getParentList(data.capabilities)].filter((list) => list !== undefined));
  }

  /**
   * Get the subscribers profile
   * @returns {Promise<Subscriber>}
   */
  async subscriber () {
    return await this.client.subscriber.getById(this.id);
  }

  async coowner(){
    return await this.client.channel.member.coowner(this.targetChannelId, this.id)
  }
  /**
   * Admin this member
   * @returns {Promise<Response>}
   */
  async admin () {
    return await this.client.channel.member.admin(this.targetChannelId, this.id);
  }

  /**
   * Mod this member
   * @returns {Promise<Response>}
   */
  async mod () {
    return await this.client.channel.member.mod(this.targetChannelId, this.id);
  }

  /**
   * Reset this member
   * @returns {Promise<Response>}
   */
  async regular () {
    return await this.client.channel.member.regular(this.targetChannelId, this.id);
  }

  /**
   * Kick this member
   * @returns {Promise<Response>}
   */
  async kick () {
    return await this.client.channel.member.kick(this.targetChannelId, this.id);
  }

  /**
   * Silence this member
   * @returns {Promise<Response>}
   */
  async silence () {
    return await this.client.channel.member.silence(this.targetChannelId, this.id);
  }

  /**
   * Ban this member
   * @returns {Promise<Response>}
   */
  async ban () {
    return await this.client.channel.member.ban(this.targetChannelId, this.id);
  }

  /**
   * Assign a Channel Role
   * @param {number} roleId
   * @returns {Promise<Response>}
   */
  async assign (roleId) {
    return await this.client.role.channel.assign(this.targetChannelId, this.id, roleId);
  }

  /**
   * Remove a Channel Role
   * @param {number} roleId
   * @returns {Promise<Response>}
   */
  async unassign (roleId) {
    return await this.client.role.channel.unassign(this.targetChannelId, this.id, roleId);
  }

  _getParentList (capabilities) {
    switch (capabilities) {
      case Capability.OWNER:
      case Capability.CO_OWNER:
      case Capability.ADMIN:
      case Capability.MOD:
        return MemberListType.PRIVILEGED;
      case Capability.REGULAR:
        return MemberListType.REGULAR;
      case Capability.SILENCED:
        return MemberListType.SILENCED;
      case Capability.BANNED:
        return MemberListType.BANNED;
      default:
        throw new Error('UNSUPPORTED Capability');
    }
  }

  addList (list) {
    return this.lists.add(list);
  }

  removeList (list) {
     return this.lists.delete(list);
  }
}

export default ChannelMember;
