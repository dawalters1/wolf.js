import Base from './Base.js';

class ChannelMember extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.targetChannelId = data?.targetGroupId;
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
}

export default ChannelMember;
