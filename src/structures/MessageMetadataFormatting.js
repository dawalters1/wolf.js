import Base from './Base.js';
import MessageMetadataFormattingChannelLink from './MessageMetadataFormattingChannelLink.js';
import MessageMetadataFormattingUrl from './MessageMetadataFormattingUrl.js';

class MessageMetadataFormatting extends Base {
  constructor (client, data) {
    super(client);

    this.channelLinks = data?.groupLinks
      ? data.groupLinks.map((channelLink) => new MessageMetadataFormattingChannelLink(client, channelLink))
      : undefined;

    this.links = data?.links
      ? data.links.map((link) => new MessageMetadataFormattingUrl(client, link))
      : undefined;
  }
}

export default MessageMetadataFormatting;
