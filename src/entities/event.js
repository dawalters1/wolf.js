import BaseEntity from './baseEntity.js';

export class Event extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.attendanceCount = entity.attendanceCount;
    this.category = entity.category;
    this.createdBy = entity.createdBy;
    this.endsAt = new Date(entity.endsAt);
    this.groupId = entity.groupId;
    this.hostedBy = entity.hostedBy;
    this.id = entity.id;
    this.imageUrl = entity.imageUrl;
    this.isRemoved = entity.isRemoved;
    this.longDescription = entity.longDescription;
    this.shortDescription = entity.shortDescription;
    this.startsAt = new Date(entity.startsAt);
    this.title = entity.title;
  }

  patch (entity) {
    this.attendanceCount = entity.attendanceCount;
    this.category = entity.category;
    this.createdBy = entity.createdBy;
    this.endsAt = new Date(entity.endsAt);
    this.groupId = entity.groupId;
    this.hostedBy = entity.hostedBy;
    this.id = entity.id;
    this.imageUrl = entity.imageUrl;
    this.isRemoved = entity.isRemoved;
    this.longDescription = entity.longDescription;
    this.shortDescription = entity.shortDescription;
    this.startsAt = new Date(entity.startsAt);
    this.title = entity.title;

    return this;
  }
}
export default Event;
