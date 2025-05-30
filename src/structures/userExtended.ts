import WOLF from '../client/WOLF.ts';
import { Gender, Language, LookingFor } from '../constants/index.ts';
import BaseEntity from './baseEntity.ts';

export interface ServerUserExtended {
  about: string;
  dateOfBirth: Date | null;
  gender: Gender;
  language: Language;
  lookingFor: LookingFor;
  urls: string[];
}

export class UserExtended extends BaseEntity {
  about: string;
  dateOfBirth: Date | null;
  gender: Gender;
  language: Language;
  lookingFor: LookingFor;
  urls: string[];

  constructor (client: WOLF,
    data: ServerUserExtended) {
    super(client);

    this.about = data.about;
    this.dateOfBirth = data.dateOfBirth;
    this.gender = data.gender;
    this.language = data.language;
    this.lookingFor = data.lookingFor;
    this.urls = data.urls;
  }
}

export default UserExtended;
