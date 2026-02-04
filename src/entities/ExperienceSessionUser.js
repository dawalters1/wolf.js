import BaseEntity from './BaseEntity.js';
import ExperienceSessionUserImageUrl from './ExperienceSessionUserImageUrl.js';
import ExperienceSessionUserXp from './ExperienceSessionUserXp.js';

export default class ExperienceSessionUser extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.userName = entity.displayName;
    this.imageUrl = new ExperienceSessionUserImageUrl(this.client, entity.imageUrl);
    this.reputation = entity.reputation;
    this.xp = entity.experienceXP
      ? new ExperienceSessionUserXp(this.client, entity.experienceXP)
      : null;
    this.score = entity.experienceScore;
  }
}
