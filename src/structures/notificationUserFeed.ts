import BaseEntity from './baseEntity.ts';
import { Language } from '../constants';
import WOLF from '../client/WOLF.ts';

export type ServerNotificationUserFeed = {
  languageId: Language;
  title: string;
  body: string;
  imageUrl: string | null;
  link: string | null;
}

export class NotificationUserFeed extends BaseEntity {
  languageId: Language;
  title: string;
  body: string;
  imageUrl: string | null;
  link: string | null;

  constructor (client: WOLF, data: ServerNotificationUserFeed) {
    super(client);

    this.languageId = data.languageId;
    this.title = data.title;
    this.body = data.body;
    this.imageUrl = data.imageUrl;
    this.link = data.link;
  }

  patch (entity: ServerNotificationUserFeed): this {
    this.languageId = entity.languageId;
    this.title = entity.title;
    this.body = entity.body;
    this.imageUrl = entity.imageUrl;
    this.link = entity.link;

    return this;
  }
}
export default NotificationUserFeed;
