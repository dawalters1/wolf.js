import Base from './Base.js';

class SubscriberEventAdditionalInfo extends Base {
  constructor (client, data) {
    super(client);
    this.eTag = data?.eTag;
    this.endsAt = data?.endsAt;
    this.startsAt = data?.startsAt;
  }

  toJSON () {
    return {
      eTag: this.eTag,
      endsAt: this.endsAt,
      startsAt: this.startsAt
    };
  }
}

export default SubscriberEventAdditionalInfo;
