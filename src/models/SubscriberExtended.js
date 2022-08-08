import { Base } from './Base.js';

class SubscriberExtended extends Base {
  constructor (client, data) {
    super(client);
    this.about = data?.about;
    this.gender = data?.gender;
    this.language = data?.language;
    this.lookingFor = data?.lookingFor;
    this.name = data?.name;
    this.relationship = data?.relationship;
    this.urls = data?.urls;
    this.utcOffset = data?.utcOffset;
  }
}

export { SubscriberExtended };
