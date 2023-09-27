import Base from './Base.js';
import { LookingFor } from '../constants/index.js';

class SubscriberExtended extends Base {
  constructor (client, data) {
    super(client);
    this.about = data?.about;
    this.dateOfBirth = data?.dateOfBirth;
    this.gender = data?.gender;
    this.language = data?.language;
    this.lookingFor = data?.lookingFor ?? LookingFor.NOT_SPECIFIED;
    this.lookingForExtended = Object.values(LookingFor).filter((value) => (this.lookingFor & value) === value);
    this.lookingForList = this.lookingForExtended;
    this.name = data?.name;
    this.relationship = data?.relationship;
    this.urls = data?.urls;
    this.utcOffset = data?.utcOffset;
  }
}

export default SubscriberExtended;
