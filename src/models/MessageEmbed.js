import Base from './Base.js';
class MessageEmbed extends Base {
  constructor (client, data) {
    super(client);
    this.type = data?.type;
    this.groupId = data?.groupId;
    this.url = data?.url;
    this.title = data?.title;
    this.image = data?.image;
    this.body = data?.body;
  }
}
export default MessageEmbed;
