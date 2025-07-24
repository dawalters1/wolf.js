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
    this.discoverable = entity.discoverable;
    this.advancedAdmin = entity.advancedAdmin;
    this.locked = entity.locked;
    this.questionable = entity.questionable;
    this.entryLevel = entity.entryLevel;
    this.passworded = entity.passworded;
    this.language = entity.language;
    this.longDescription = entity.longDescription || null;
  }

  /** @internal */
  patch (entity) {
    this.id = entity.id;
    this.discoverable = entity.discoverable;
    this.advancedAdmin = entity.advancedAdmin;
    this.locked = entity.locked;
    this.questionable = entity.questionable;
    this.entryLevel = entity.entryLevel;
    this.passworded = entity.passworded;
    this.language = entity.language;
    this.longDescription = entity.longDescription || null;

    return this;
  }
}

export default ChannelExtended;
