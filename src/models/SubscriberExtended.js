import Base from './Base.js';
import { LookingFor } from '../constants/index.js';

class SubscriberExtended extends Base {
  constructor (client, data) {
    super(client);
    this.about = data?.about;
    this.gender = data?.gender;
    this.language = data?.language;
    this.lookingFor = data?.lookingFor ?? LookingFor.NOT_SPECIFIED;
    this.lookingForExtended = Object.values(LookingFor).filter((value) => (this.lookingFor & value) === value);
    this.name = data?.name;
    this.relationship = data?.relationship;
    this.urls = data?.urls;
    this.utcOffset = data?.utcOffset;
  }

  toJSON () {
    return {
      about: this.about,
      gender: this.gender,
      language: this.gender,
      lookingFor: this.lookingFor,
      lookingForExtended: this.lookingForExtended,
      name: this.name,
      relationship: this.relationship,
      urls: this.urls,
      utcOffset: this.utcOffset
    };
  }
}

export default SubscriberExtended;
