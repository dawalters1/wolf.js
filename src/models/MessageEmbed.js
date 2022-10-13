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

  toJSON () {
    return {
      type: this.type,
      groupid: this.groupId,
      url: this.url,
      title: this.title,
      image: this.image,
      body: this.body
    };
  }
}

export default MessageEmbed;
