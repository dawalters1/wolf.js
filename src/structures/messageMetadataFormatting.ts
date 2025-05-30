import WOLF from '../client/WOLF.ts';
import BaseEntity from './baseEntity.ts';
import MessageMetadataFormattingChannelLink, { ServerMessageMetadataFormattingChannelLink } from './messageMetadataFormattingChannelLink.ts';
import MessageMetadataFormattingUrl, { ServerMessageMetadataFormattingUrl } from './messageMetadataFormattingUrl.ts';

export interface ServerMessageMetadataFormatting {
  groupLinks?: ServerMessageMetadataFormattingChannelLink[];
  links?: ServerMessageMetadataFormattingUrl[];
}

export class MessageMetadataFormatting extends BaseEntity {
  channelLinks: MessageMetadataFormattingChannelLink[] | null;
  links: MessageMetadataFormattingUrl[] | null;

  constructor (client: WOLF, data: ServerMessageMetadataFormatting) {
    super(client);

    this.channelLinks = data.groupLinks
      ? data.groupLinks.map((groupLink) => new MessageMetadataFormattingChannelLink(client, groupLink))
      : null;

    this.links = data.links
      ? data.links.map((link) => new MessageMetadataFormattingUrl(client, link))
      : null;
  }
}

export default MessageMetadataFormatting;
