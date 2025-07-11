// ChannelExtended.js
import BaseEntity from './baseEntity.js';

class ChannelExtended extends BaseEntity {
  /**
 * Creates an instance of ChannelExtended.
 **
 * @constructor
 * @param {import('../client/WOLF.js').default} client The client instance
 * @param {*} data The data parameter
 */
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.discoverable = data.discoverable;
    this.advancedAdmin = data.advancedAdmin;
    this.locked = data.locked;
    this.questionable = data.questionable;
    this.entryLevel = data.entryLevel;
    this.passworded = data.passworded;
    this.language = data.language;
    this.longDescription = data.longDescription || null;
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
