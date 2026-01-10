import BaseEntity from './BaseEntity.js';
import MessageMetadataFormattingChannelLink from './MessageMetadataFormattingChannelLink.js';
import MessageMetadataFormattingUrl from './MessageMetadataFormattingUrl.js';

export default class MessageMetadataFormatting extends BaseEntity {
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
