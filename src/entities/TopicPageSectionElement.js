import BaseEntity from './BaseEntity.js';
import TopicPageSectionElementProperties from './TopicPageSectionElementProperties.js';

export default class TopicPageSectionElement extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.languageId = entity.languageId;
    this.onInvalid = entity?.onInvalid ?? null;
    this.properties = entity.properties
      ? new TopicPageSectionElementProperties(this.client, entity.properties, this.languageId)
      : null;
    this.type = entity.type;
  }
}
