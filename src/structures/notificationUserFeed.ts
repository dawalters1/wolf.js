import BaseEntity from './baseEntity.ts';
import { Language } from '../constants/Language.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerNotificationUserFeed {
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
}
export default NotificationUserFeed;
