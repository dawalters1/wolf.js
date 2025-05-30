import WOLF from '../client/WOLF.ts';
import { Language } from '../constants/Language.ts';
import Base from './base.ts';

export interface ServerNotificationGlobalPopup {
  languageId: Language;
  title: string;
  body: string;
  imageUrl: string | null;
  link: string | null;
  dismissText: string;
  linkText: string | null;
  priority: null;
}

export class NotificationGlobalPopup extends Base {
  languageId: Language;
  title: string;
  body: string;
  imageUrl: string | null;
  link: string | null;
  dismissText: string;
  linkText: string | null;
  priority: null;

  constructor (client: WOLF, data: ServerNotificationGlobalPopup) {
    super(client);

    this.languageId = data.languageId;
    this.title = data.title;
    this.body = data.body;
    this.imageUrl = data.imageUrl;
    this.link = data.link;
    this.dismissText = data.dismissText;
    this.linkText = data.linkText;
    this.priority = data.priority;
  }
}

export default NotificationGlobalPopup;
