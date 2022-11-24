import Base from './Base.js';

class GroupSubscriberUpdate extends Base {
  constructor (client, data) {
    super(client);

    this.groupId = data?.groupId;
    this.sourceId = data?.sourceId;
    this.targetId = data?.targetId;
    this.action = data?.action;
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
