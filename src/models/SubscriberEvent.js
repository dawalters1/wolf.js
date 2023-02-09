import Base from './Base.js';
import SubscriberEventAdditionalInfo from './SubscriberEventAdditionalInfo.js';

class SubscriberEvent extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.groupId = data?.groupId;
    this.additionalInfo = new SubscriberEventAdditionalInfo(client, data?.additionalInfo);
  }

  async get () {
    return await this.client.event.getById(this.id);
  }

  async subscribe () {
    return await this.client.event.subscription.add(this.id);
  }

  async unsubscribe () {
    return await this.client.event.subscription.remove(this.id);
  }
}

export default SubscriberEvent;
