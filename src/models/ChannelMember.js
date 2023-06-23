import Base from './Base.js';

class ChannelMember extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.targetGroupId = data?.targetGroupId;
    this.hash = data?.hash;
    this.capabilities = data?.capabilities;
  }

  async subscriber () {
    return await this.client.subscriber.getById(this.id);
  }

  async admin () {
    return await this.client.channel.member.admin(this.targetGroupId, this.id);
  }

  async mod () {
    return await this.client.channel.member.mod(this.targetGroupId, this.id);
  }

  async regular () {
    return await this.client.channel.member.regular(this.targetGroupId, this.id);
  }

  async silence () {
    return await this.client.channel.member.silence(this.targetGroupId, this.id);
  }

  async kick () {
    return await this.client.channel.member.kick(this.targetGroupId, this.id);
  }

  async ban () {
    return await this.client.channel.member.ban(this.targetGroupId, this.id);
  }
}

export default ChannelMember;
