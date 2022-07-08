const Base = require('./Base');
const NotificationAction = require('./NotificationAction');

class Notification extends Base {
  constructor (client, data) {
    super(client);

    this.actions = data.actions ? data.actions.map((action) => new NotificationAction(client, action)) : null;
    this.endAt = data.endAt;
    this.favourite = data.favourite;
    this.global = data.global;
    this.id = data.id;
    this.imageUrl = data.imageUrl;
    this.layoutType = data.layoutType;
    this.link = data.link;
    this.message = data.message;
    this.metadata = data.metadata;
    this.newsStreamType = data.newsStreamType;
    this.persistent = data.persistent;
    this.startsAt = data.startsAt;
    this.title = data.title;
    this.type = data.type;
  }
}

module.exports = Notification;
