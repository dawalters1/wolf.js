import BaseEntity from './baseEntity.ts';
import { Gender, Language, LookingFor } from '../constants/index.ts';
import WOLF from '../client/WOLF.ts';

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

  constructor (client: WOLF, data: ServerUserExtended) {
    super(client);

    this.about = data.about;
    this.dateOfBirth = data?.dateOfBirth
      ? new Date(data.dateOfBirth)
      : null;
    this.gender = data.gender;
    this.language = data.language;
    this.lookingFor = data.lookingFor;
    this.urls = data.urls;
  }

  patch (entity: any): this {
    return this;
  }
}

export default UserExtended;
