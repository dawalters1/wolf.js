import BaseEntity from './baseEntity.js';

export class TopicPageSectionColour extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.background = entity?.background ?? null;
    this.hasLightContent = entity?.hasLightContent ?? false;
  }
}

export default TopicPageSectionColour;
