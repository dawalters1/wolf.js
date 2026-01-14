import BaseEntity from './BaseEntity.js';

export default class TopicPageSectionElementPropertyLink extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.text = entity?.text ?? null;
    this.url = entity?.url ?? null;
  }
}
