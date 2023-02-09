import Base from './Base.js';

class GroupMember extends Base {
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
    return await this.client.group.member.admin(this.targetGroupId, this.id);
  }

  async mod () {
    return await this.client.group.member.mod(this.targetGroupId, this.id);
  }

  async regular () {
    return await this.client.group.member.regular(this.targetGroupId, this.id);
  }

  async silence () {
    return await this.client.group.member.silence(this.targetGroupId, this.id);
  }

  async kick () {
    return await this.client.group.member.kick(this.targetGroupId, this.id);
  }

  async ban () {
    return await this.client.group.member.ban(this.targetGroupId, this.id);
  }
}

export default GroupMember;
