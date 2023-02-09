import Base from './Base.js';

class SubscriberEventAdditionalInfo extends Base {
  constructor (client, data) {
    super(client);
    this.eTag = data?.eTag;
    this.endsAt = data?.endsAt;
    this.startsAt = data?.startsAt;
  }
}

export default SubscriberEventAdditionalInfo;
