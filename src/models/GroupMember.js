import Base from './Base.js';

class GroupMember extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.hash = data?.hash;
    this.capabilities = data?.capabilities;
  }

  async subscriber () {
    return await this.client.subscriber.getById(this.id);
  }

  toJSON () {
    return {
      id: this.id,
      hash: this.hash,
      capabilities: this.capabilities
    };
  }
}

export default GroupMember;
