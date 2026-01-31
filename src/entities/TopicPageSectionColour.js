import BaseEntity from './BaseEntity.js';

export default class TopicPageSectionColour extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.background = entity?.background ?? null;
    this.hasLightContent = entity?.hasLightContent ?? false;
  }
}
