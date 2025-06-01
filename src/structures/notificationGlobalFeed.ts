import BaseEntity from './baseEntity.ts';
import { Language } from '../constants';
import WOLF from '../client/WOLF.ts';

export interface ServerNotificationGlobalFeed {
  languageId: Language;
  title: string;
  body: string;
  imageUrl: string | null;
  link: string | null;
}

export class NotificationGlobalFeed extends BaseEntity {
  languageId: Language;
  title: string;
  body: string;
  imageUrl: string | null;
  link: string | null;

  constructor (client: WOLF, data: ServerNotificationGlobalFeed) {
    super(client);

    this.languageId = data.languageId;
    this.title = data.title;
    this.body = data.body;
    this.imageUrl = data.imageUrl;
    this.link = data.link;
  }
}
export default NotificationGlobalFeed;
