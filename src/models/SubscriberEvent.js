import Base from './Base.js';
import SubscriberEventAdditionalInfo from './SubscriberEventAdditionalInfo.js';

class SubscriberEvent extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.groupId = data?.groupId;
    this.additionalInfo = new SubscriberEventAdditionalInfo(client, data?.additionalInfo);
  }

  toJSON () {
    return {
      id: this.id,
      groupId: this.groupId,
      additionalInfo: this.additionalInfo.toJSON()
    };
  }
}

export default SubscriberEvent;
