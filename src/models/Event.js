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
    this.isRemoved = data?.isRemoved ?? false;
    this.attendanceCount = data?.attendanceCount;

    this.exists = Object.keys(data).length > 1;
  }

  toJSON () {
    return {
      id: this.id,
      groupId: this.groupId,
      createdBy: this.createdBy,
      title: this.title,
      category: this.category,
      shortDescription: this.shortDescription,
      longDescription: this.shortDescription,
      imageUrl: this.imageUrl,
      startsAt: this.startsAt,
      endsAt: this.endsAt,
      isRemoved: this.isRemoved,
      attendanceCount: this.attendanceCount,
      exists: this.exists
    };
  }
}

export default Event;
