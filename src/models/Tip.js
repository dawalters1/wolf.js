import Base from './Base.js';
import TipCharm from './TipCharm.js';
import TipContext from './TipContext.js';

class Tip extends Base {
  constructor (client, data) {
    super(client);
    this.charmList = data?.charmList.map((charm) => new TipCharm(client, charm)) ?? [];
    this.groupId = data?.groupId;
    this.isGroup = !!this.groupId;
    this.sourceSubscriberId = data?.sourceSubscriberId;
    this.subscriberId = data?.subscriberId;
    this.context = new TipContext(client, data?.context);
  }

  async charms () {
    return await this.client.charm.getByIds(this.charmList.map((charm) => charm.charmId));
  }

  async group () {
    return await this.client.group.getById(this.groupId);
  }

  async sourceSubscriber () {
    return await this.client.subscriber.getById(this.sourceSubscriberId);
  }

  async targetSubscriber () {
    return await this.client.subscriber.getById(this.subscriberId);
  }

  toJSON () {
    return {
      charmList: this.charmList.map((item) => item.toJSON()),
      groupId: this.groupId,
      isGroup: this.isGroup,
      sourceSubscriberId: this.sourceSubscriberId,
      subscriberId: this.subscriberId,
      context: this.context.toJSON()
    };
  }
}

export default Tip;
