
import BaseEntity from './baseEntity.js';

export class TopicPageSectionElementPropertyLink extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.text = entity?.text ?? null;
    this.url = entity?.url ?? null;
  }
}

export default TopicPageSectionElementPropertyLink;
