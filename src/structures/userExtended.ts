import BaseEntity from './baseEntity.ts';
import { Gender, Language, LookingFor } from '../constants/index.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerUserExtended {
  about: string;
  dateOfBirth: Date | null;
  gender: Gender;
  language: Language;
  lookingFor: LookingFor;
  urls?: string[];
}

export class UserExtended extends BaseEntity {
  about: string | null;
  dateOfBirth: Date | null;
  gender: Gender;
  language: Language;
  lookingFor: LookingFor;
  urls: Set<string> = new Set();

  constructor (client: WOLF, data: ServerUserExtended) {
    super(client);

    this.about = data?.about ?? null;
    this.dateOfBirth = data?.dateOfBirth
      ? new Date(data.dateOfBirth)
      : null;
    this.gender = data.gender;
    this.language = data.language;
    this.lookingFor = data.lookingFor;

    this.urls = new Set(data.urls ?? []);
  }

  patch (entity: ServerUserExtended): this {
    this.about = entity.about;
    this.dateOfBirth = entity?.dateOfBirth
      ? new Date(entity.dateOfBirth)
      : null;
    this.gender = entity.gender;
    this.language = entity.language;
    this.lookingFor = entity.lookingFor;
    this.urls = new Set(entity.urls ?? []);

    return this;
  }
}

export default UserExtended;
