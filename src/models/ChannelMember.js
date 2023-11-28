import Base from './Base.js';

class ChannelMember extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.targetChannelId = data?.targetChannelId;
    this.targetGroupId = this.targetChannelId;
    this.hash = data?.hash;
    this.capabilities = data?.capabilities;
  }

  /**
   * Get the subscribers profile
   * @returns {Promise<Subscriber>}
   */
  async subscriber () {
    return await this.client.subscriber.getById(this.id);
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
}

export default ChannelMember;
