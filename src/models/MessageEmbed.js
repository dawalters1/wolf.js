const Base = require('./Base');

class MessageEmbed extends Base {
  constructor (client, data) {
    super(client);

    this.type = data.type;
    this.groupId = data.groupId;
    this.url = data.url;
    this.title = data.title;
    this.image = data.image;
    this.body = data.body;
  }
}

module.exports = MessageEmbed;
