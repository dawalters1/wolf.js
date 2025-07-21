import BaseEntity from './baseEntity.js';

export class Ad extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.start = entity.index;
    this.end = this.start + entity[0].length;
    this.ad = entity[0];
    this.channelName = entity[1].trim();
  }

  /**
 * Get the specified Channel
 **
 * @async
 * @returns {Promise<import('../entities/channel.js').default>} The channel
 */
  async channel () {
    return this.client.channel.getByName(this.channelName);
  }
}

export default Ad;
