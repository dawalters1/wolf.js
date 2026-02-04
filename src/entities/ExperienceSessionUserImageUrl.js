import BaseEntity from './BaseEntity.js';

export default class ExperienceSessionUserImageUrl extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.placeholder = entity.placeholder;
    this.formats = new Set(entity.formats);
    this.small = entity?.small ?? null;
    this.medium = entity?.medium ?? null;
    this.large = entity?.large ?? null;
    this.xLarge = entity?.xLarge ?? null;
  }
}
