import BaseEntity from './BaseEntity.js';

export default class ExperienceSessionUserXp extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.current = entity.current;
    this.threshold = entity.threshold;
    this.thresholdPreviously = entity.thresholdPreviously;
    this.proportion = entity.proportion;
    this.level = entity.level;
  }
}
