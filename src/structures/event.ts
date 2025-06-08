import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerEvent {
  attendanceCount: number;
  category: number;
  createdBy: number;
  endsAt: Date;
  groupId: number;
  hostedBy: number | null;
  id: number;
  imageUrl: string | null;
  isRemoved: boolean;
  longDescription: string | null;
  shortDescription: string | null;
  startsAt: Date;
  title: string
}

export class Event extends BaseEntity {
  @key
    id: number;

  attendanceCount: number;
  category: number | null;
  createdBy: number;
  endsAt: Date;
  groupId: number;
  hostedBy: number | null;
  imageUrl: string | null;
  isRemoved: boolean;
  longDescription: string | null;
  shortDescription: string | null;
  startsAt: Date;
  title: string;

  constructor (client: WOLF, data: ServerEvent) {
    super(client);

    this.attendanceCount = data.attendanceCount;
    this.category = data.category;
    this.createdBy = data.createdBy;
    this.endsAt = new Date(data.endsAt);
    this.groupId = data.groupId;
    this.hostedBy = data.hostedBy;
    this.id = data.id;
    this.imageUrl = data.imageUrl;
    this.isRemoved = data.isRemoved;
    this.longDescription = data.longDescription;
    this.shortDescription = data.shortDescription;
    this.startsAt = new Date(data.startsAt);
    this.title = data.title;
  }

  patch (entity: ServerEvent): this {
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
