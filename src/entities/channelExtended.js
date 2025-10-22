// ChannelExtended.js
import BaseEntity from './baseEntity.js';

class ChannelExtended extends BaseEntity {
  /**
 * Creates an instance of ChannelExtended.
 **
 * @constructor
 * @param {import('../client/WOLF.js').default} client The client instance
 * @param {*} entity The data parameter
 */
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.discoverable = entity.discoverable ?? false;
    this.advancedAdmin = entity.advancedAdmin ?? false;
    this.locked = entity.locked ?? false;
    this.hub = entity?.hub;
    this.questionable = entity.questionable ?? false;
    this.entryLevel = entity.entryLevel ?? 0;
    this.passworded = entity.passworded ?? false;
    this.language = entity.language ?? null;
    this.longDescription = entity.longDescription || null;
  }
}

export default ChannelExtended;
