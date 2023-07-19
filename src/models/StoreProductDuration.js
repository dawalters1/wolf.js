import Base from './Base.js';

class StoreProductDuration extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.days = data.days;
    this.credits = data.credits;
  }

  /**
   * Purchase an item
   * @param {Number} quanitity
   * @param {Number | Number[]} targetIds
   * @returns {Promise<Response>}
   */
  async purchase (quanitity, targetIds) {
    return await this.client.store.purchase(this.id, quanitity, targetIds);
  }
}

export default StoreProductDuration;
