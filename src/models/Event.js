import Base from './Base.js';
class Event extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.groupId = data?.groupId;
    this.createdBy = data?.createdBy;
    this.title = data?.title;
    this.category = data?.category;
    this.shortDescription = data?.shortDescription;
    this.longDescription = data?.longDescription;
    this.imageUrl = data?.imageUrl;
    this.startsAt = data?.startsAt;
    this.endsAt = data?.endsAt;
    this.isRemoved = data?.isRemoved;
    this.attendanceCount = data?.attendanceCount;
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;
  }
}
export default Event;
