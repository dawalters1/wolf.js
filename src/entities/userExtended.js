
import BaseEntity from './baseEntity.js';

export class UserExtended extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.about = entity.about ?? null;
    this.dateOfBirth = entity.dateOfBirth
      ? new Date(entity.dateOfBirth)
      : null;
    this.gender = entity.gender ?? null;
    this.language = entity.language ?? null;
    this.lookingFor = entity.lookingFor ?? null;
    this.urls = new Set(entity.urls ?? []);
  }

  /** @internal */
  patch (entity) {
    this.about = entity.about ?? null;
    this.dateOfBirth = entity.dateOfBirth
      ? new Date(entity.dateOfBirth)
      : null;
    this.gender = entity.gender ?? null;
    this.language = entity.language ?? null;
    this.lookingFor = entity.lookingFor ?? null;
    this.urls = new Set(entity.urls ?? []);

    return this;
  }
}

export default UserExtended;
