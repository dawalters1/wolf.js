import BaseEntity from './BaseEntity.js';

export default class TopicPageSectionElementPropertyAspect extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.width = entity?.width ?? null;
    this.height = entity?.height ?? null;
  }
}
