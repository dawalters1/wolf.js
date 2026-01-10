import BaseEntity from './BaseEntity.js';

export default class CommandContext extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.isChannel = entity?.isChannel;
    this.body = entity?.body;
    this.language = entity?.language;
    this.targetChannelId = entity?.targetChannelId ?? undefined;
    this.sourceUserId = entity?.sourceUserId ?? undefined;
    this.timestamp = entity?.timestamp;
    this.type = entity?.type;
    this.route = entity?.route;

    this.bodyParts = this.body?.split(this.client.SPLIT_REGEX)?.filter(Boolean) ?? [];
  }
}
