import BaseEntity from './BaseEntity.js';

export default class TopicPageSectionValidity extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.endTime = entity?.endTime
      ? new Date(entity.endTime)
      : null;
    this.fromTime = entity.fromTime
      ? new Date(entity.fromTime)
      : null;
  }
}
