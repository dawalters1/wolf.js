import Base from './Base.js';
import MessageMetadataFormattingChannelLink from './MessageMetadataFormattingChannelLink.js';
import MessageMetadataFormattingUrl from './MessageMetadataFormattingUrl.js';

class MessageMetadataFormatting extends Base {
  constructor (client, data) {
    super(client);
    this.grouplinks = data?.groupLinks?.map((link) => new MessageMetadataFormattingChannelLink(client, link)) ?? null;
    this.channellinks = data?.groupLinks?.map((link) => new MessageMetadataFormattingChannelLink(client, link)) ?? null;
    this.links = data?.links?.map((link) => new MessageMetadataFormattingUrl(client, link)) ?? null;
  }
}

export default MessageMetadataFormatting;
