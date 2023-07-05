import Base from './Base.js';

class MessageEmbed extends Base {
  constructor (client, data) {
    super(client);
    this.type = data?.type;
    this.channelId = data?.groupId;
    this.groupId = this.channelId;
    this.url = data?.url;
    this.title = data?.title;
    this.image = data?.image;
    this.body = data?.body;
  }
}

export default MessageEmbed;
