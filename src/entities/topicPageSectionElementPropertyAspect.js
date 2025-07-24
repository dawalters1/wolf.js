
import BaseEntity from './baseEntity.js';

export class TopicPageSectionElementPropertyAspect extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.width = entity?.width ?? null;
    this.height = entity?.height ?? null;
  }
}

export default TopicPageSectionElementPropertyAspect;
