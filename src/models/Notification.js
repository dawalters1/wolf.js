import Base from './Base.js';
import NotificationAction from './NotificationAction.js';

class Notification extends Base {
  constructor (client, data) {
    super(client);
    this.actions = data?.actions.map((action) => new NotificationAction(client, action)) ?? null;
    this.endAt = data?.endAt;
    this.favourite = data?.favourite;
    this.global = data?.global;
    this.id = data?.id;
    this.imageUrl = data?.imageUrl;
    this.layoutType = data?.layoutType;
    this.link = data?.link;
    this.message = data?.message;
    this.metadata = data?.metadata;
    this.newsStreamType = data?.newsStreamType;
    this.persistent = data?.persistent;
    this.startsAt = data?.startsAt;
    this.title = data?.title;
    this.type = data?.type;
  }

  toJSON () {
    return {
      actions: this.actions?.map((item) => item.toJSON()),
      endAt: this.endAt,
      favourite: this.favourite,
      global: this.global,
      id: this.id,
      imageUrl: this.imageUrl,
      layoutType: this.layoutType,
      link: this.link,
      message: this.message,
      metadata: this.metadata,
      newsStreamType: this.newsStreamType,
      persistent: this.persistent,
      startsAt: this.startsAt,
      title: this.title,
      type: this.type
    };
  }
}

export default Notification;
