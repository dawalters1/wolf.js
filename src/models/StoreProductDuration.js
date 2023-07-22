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
   * @param {Number} quantity
   * @param {Number | Number[]} targetIds
   * @returns {Promise<Response>}
   */
  async purchase (quantity, targetIds) {
    return await this.client.store.purchase(this.id, quantity, targetIds);
  }
}

export default StoreProductDuration;
