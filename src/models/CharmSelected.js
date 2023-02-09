import Base from './Base.js';

class CharmSelected extends Base {
  constructor (client, data) {
    super(client);
    this.charmId = data?.charmId;
    this.position = data?.position;
  }

  async charm () {
    return await this.client.charm.getById(this.charmId);
  }

  async deselect () {
    return await this.client.charm.set();
  }
}

export default CharmSelected;
