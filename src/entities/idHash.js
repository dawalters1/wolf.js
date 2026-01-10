import BaseEntity from './baseEntity.js';

export class IdHash extends BaseEntity {
  /**
 * Creates an instance of IdHash.
 **
 * @constructor
 * @param {import('../client/WOLF.js').default} client The client instance
 * @param {*} entity The entity object
 * @param {boolean} [isChannel=false]
 */
  constructor (client, entity, isChannel = false) {
    super(client);
    this.id = entity.id;
    this.hash = entity.hash;
    this.isChannel = isChannel;
  }
}

export default IdHash;
