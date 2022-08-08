import { Base } from './Base.js';
import { MessageMetadataFormattingGroupLink } from './MessageMetadataFormattingGroupLink.js';
import { MessageMetadataFormattingUrl } from './MessageMetadataFormattingUrl.js';

class MessageMetadataFormatting extends Base {
  constructor (client, data) {
    super(client);
    this.grouplinks = data?.groupLinks ? data?.groupLinks.map((link) => new MessageMetadataFormattingGroupLink(client, link)) : null;
    this.links = data?.links ? data?.links.map((link) => new MessageMetadataFormattingUrl(client, link)) : null;
  }
}

export { MessageMetadataFormatting };
