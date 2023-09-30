import Base from './Base.js';

class ChannelRoleContext extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.description = data?.description;
    this.emojiUrl = data?.emojiUrl;
    this.name = data?.name;
    this.hexColour = data?.hexColour;
  }
}

export default ChannelRoleContext;
