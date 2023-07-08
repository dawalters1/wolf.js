import Base from './Base.js';

class NotificationFeed extends Base {
  constructor (client, data) {
    super(client);

    this.body = data?.body;
    this.imageUrl = data?.imageUrl;
    this.languageId = data?.languageId;
    this.link = data?.link;
    this.title = data?.title;
  }
}

export default NotificationFeed;
