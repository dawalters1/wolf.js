import Base from './Base.js';

class NotificationAction extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.titleText = data?.titleText;
    this.actionUrl = data?.actionUrl;
    this.external = data?.external;
    this.imageUrl = data?.imageUrl;
  }

  toJSON () {
    return {
      id: this.id,
      titleText: this.titleText,
      actionUrl: this.actionUrl,
      external: this.external,
      imageUrl: this.imageUrl
    };
  }
}

export default NotificationAction;
