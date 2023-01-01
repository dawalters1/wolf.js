import Base from './Base.js';

class GroupSubscriberUpdate extends Base {
  constructor (client, data) {
    super(client);

    this.groupId = data?.groupId;
    this.sourceId = data?.sourceId;
    this.targetId = data?.targetId;
    this.action = data?.action;
  }

  async group () {
    return await this.client.group.getById(this.groupId);
  }

  async sourceSubscriber () {
    return await this.client.subscriber.getById(this.sourceId);
  }

  async targetSubscriber () {
    return await this.client.subscriber.getById(this.targetId);
  }

  toJSON () {
    return {
      groupId: this.groupId,
      sourceId: this.sourceId,
      targetId: this.targetId,
      action: this.action
    };
  }
}

export default GroupSubscriberUpdate;
