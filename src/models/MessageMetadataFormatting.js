import Base from './Base.js';
import MessageMetadataFormattingGroupLink from './MessageMetadataFormattingGroupLink.js';
import MessageMetadataFormattingUrl from './MessageMetadataFormattingUrl.js';

class MessageMetadataFormatting extends Base {
  constructor (client, data) {
    super(client);
    this.grouplinks = data?.groupLinks.map((link) => new MessageMetadataFormattingGroupLink(client, link)) ?? null;
    this.links = data?.links.map((link) => new MessageMetadataFormattingUrl(client, link)) ?? null;
  }

  toJSON () {
    return {
      groupLinks: this.grouplinks?.map((item) => item.toJSON()),
      links: this.links?.map((item) => item.toJSON())
    };
  }
}

export default MessageMetadataFormatting;
