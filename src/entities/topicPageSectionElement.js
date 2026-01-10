
import BaseEntity from './baseEntity.js';
import TopicPageSectionElementProperties from './topicPageSectionElementProperties.js';

export class TopicPageSectionElement extends BaseEntity {
  constructor (client, entity, languageId) {
    super(client);

    this.onInvalid = entity?.onInvalid ?? null;
    this.properties = entity.properties
      ? new TopicPageSectionElementProperties(this.client, entity.properties, languageId)
      : null;
    this.type = entity.type;
  }
}

export default TopicPageSectionElement;
