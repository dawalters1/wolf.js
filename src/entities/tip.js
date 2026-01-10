import BaseEntity from './BaseEntity.js';
import TipCharm from './TipCharm.js';
import TipContext from './TipContext.js';

export default class Tip extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.charmList = entity?.charmList.map((charm) => new TipCharm(client, charm)) ?? [];
    this.channelId = entity?.groupId;
    this.isChannel = !!this.channelId;
    this.sourceUserId = entity?.sourceSubscriberId;
    this.userId = entity?.subscriberId;
    this.context = new TipContext(client, entity?.context);
    this.version = entity.version;
  }
}
