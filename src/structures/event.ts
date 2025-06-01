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
  category: number;
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
    this.endsAt = data.endsAt;
    this.groupId = data.groupId;
    this.hostedBy = data.hostedBy;
    this.id = data.id;
    this.imageUrl = data.imageUrl;
    this.isRemoved = data.isRemoved;
    this.longDescription = data.longDescription;
    this.shortDescription = data.shortDescription;
    this.startsAt = data.startsAt;
    this.title = data.title;
  }

  protected _patch (event: Event): void {
    this.attendanceCount = event.attendanceCount;
    this.category = event.category;
    this.createdBy = event.createdBy;
    this.endsAt = event.endsAt;
    this.groupId = event.groupId;
    this.hostedBy = event.hostedBy;
    this.imageUrl = event.imageUrl;
    this.isRemoved = event.isRemoved;
    this.longDescription = event.longDescription;
    this.shortDescription = event.shortDescription;
    this.startsAt = event.startsAt;
    this.title = event.title;
  }
}
export default Event;
