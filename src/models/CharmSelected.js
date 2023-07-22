import Base from './Base.js';

class CharmSelected extends Base {
  constructor (client, data) {
    super(client);
    this.charmId = data?.charmId;
    this.position = data?.position;
  }

  /**
   * Get the charm
   * @returns {Promise<Charm>}
   */
  async charm () {
    return await this.client.charm.getById(this.charmId);
  }

  /**
   * Remove the selected charm
   * @returns {Promise<Response>}
   */
  async deselect () {
    return await this.client.charm.set();
  }
}

export default CharmSelected;
