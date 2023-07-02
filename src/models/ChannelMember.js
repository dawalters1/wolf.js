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

  async subscriber () {
    return await this.client.subscriber.getById(this.id);
  }

  async admin () {
    return await this.client.channel.member.admin(this.targetChannelId, this.id);
  }

  async mod () {
    return await this.client.channel.member.mod(this.targetChannelId, this.id);
  }

  async regular () {
    return await this.client.channel.member.regular(this.targetChannelId, this.id);
  }

  async silence () {
    return await this.client.channel.member.silence(this.targetChannelId, this.id);
  }

  async kick () {
    return await this.client.channel.member.kick(this.targetChannelId, this.id);
  }

  async ban () {
    return await this.client.channel.member.ban(this.targetChannelId, this.id);
  }
}

export default ChannelMember;
