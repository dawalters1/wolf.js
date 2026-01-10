import BaseEntity from './baseEntity.js';
import MessageMetadataFormattingChannelLink from './messageMetadataFormattingChannelLink.js';
import MessageMetadataFormattingUrl from './messageMetadataFormattingUrl.js';

export class MessageMetadataFormatting extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.channelLinks = entity.groupLinks
      ? entity.groupLinks.map((groupLink) => new MessageMetadataFormattingChannelLink(client, groupLink))
      : null;

    this.links = entity.links
      ? entity.links.map((link) => new MessageMetadataFormattingUrl(client, link))
      : null;
  }
}

export default MessageMetadataFormatting;
