import Base from './Base.js';
import SubscriberEventAdditionalInfo from './SubscriberEventAdditionalInfo.js';
class SubscriberEvent extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.groupId = data?.groupId;
    this.additionalInfo = new SubscriberEventAdditionalInfo(client, data?.additionalInfo);
  }
}
export default SubscriberEvent;
