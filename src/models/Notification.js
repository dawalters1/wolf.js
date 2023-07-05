import Base from './Base.js';
import NotificationFeed from './NotificationFeed.js';

class Notification extends Base {
  constructor (client, data) {
    super(client);

    this.context = data?.context;
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;
    this.feed = data?.feed ? new NotificationFeed(client, data?.feed) : undefined;
    this.id = data?.id;
    this.notificationId = data?.notificationId;
    this.presentationType = data?.presentationType;
    this.typeId = data?.typeId;

    this.exists = Object.values(data).length > 1;
  }
}

export default Notification;
