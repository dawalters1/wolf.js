import BaseEntity from './BaseEntity.js';

export default class Event extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.attendanceCount = entity.attendanceCount;
    this.category = entity.category;
    this.createdBy = entity.createdBy;
    this.endsAt = new Date(entity.endsAt);
    this.groupId = entity.groupId;
    this.hostedBy = entity.hostedBy;
    this.imageUrl = entity.imageUrl;
    this.isRemoved = entity.isRemoved;
    this.longDescription = entity.longDescription;
    this.shortDescription = entity.shortDescription;
    this.startsAt = new Date(entity.startsAt);
    this.title = entity.title;
  }
}
